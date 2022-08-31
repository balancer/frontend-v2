import { Signer } from '@ethersproject/abstract-signer';
import {
  domain as domainGp,
  EcdsaSignature,
  EcdsaSigningScheme,
  IntChainIdTypedDataV4Signer,
  Order,
  OrderCancellation as OrderCancellationGp,
  Signature,
  SigningScheme,
  signOrder as signOrderGp,
  signOrderCancellation as signOrderCancellationGp,
  TypedDataV3Signer,
} from '@cowprotocol/contracts';

import { networkId } from '@/composables/useNetwork';
import { WalletError } from '@/types';

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from './constants';

// For error codes, see:
// - https://eth.wiki/json-rpc/json-rpc-error-codes-improvement-proposal
// - https://www.jsonrpc.org/specification#error_object
const METAMASK_SIGNATURE_ERROR_CODE = -32603;
const METHOD_NOT_FOUND_ERROR_CODE = -32601;
const V4_ERROR_MSG_REGEX = /eth_signTypedData_v4 does not exist/i;
const V3_ERROR_MSG_REGEX = /eth_signTypedData_v3 does not exist/i;
const RPC_REQUEST_FAILED_REGEX = /RPC request failed/i;
const METAMASK_STRING_CHAINID_REGEX =
  /provided chainid .* must match the active chainid/i;

export type UnsignedOrder = Omit<Order, 'receiver'> & { receiver: string };

export interface SignOrderParams {
  signer: Signer;
  order: UnsignedOrder;
  signingScheme: EcdsaSigningScheme;
}

export interface OrderCreation extends UnsignedOrder {
  signature: string; // 65 bytes encoded as hex without `0x` prefix. v + r + s from the spec
  signingScheme: EcdsaSigningScheme; // value of
}

export interface SingOrderCancellationParams {
  signer: Signer;
  orderId: string;
  signingScheme: EcdsaSigningScheme;
}

export interface OrderCancellation extends OrderCancellationGp {
  signature: string;
  signingScheme: EcdsaSigningScheme;
}

interface SchemaInfo {
  libraryValue: number;
  apiValue: string;
}
const mapSigningSchema: Map<SigningScheme, SchemaInfo> = new Map([
  [SigningScheme.EIP712, { libraryValue: 0, apiValue: 'eip712' }],
  [SigningScheme.ETHSIGN, { libraryValue: 1, apiValue: 'ethsign' }],
]);

function _getSigningSchemeInfo(
  ecdaSigningScheme: EcdsaSigningScheme
): SchemaInfo {
  const value = mapSigningSchema.get(ecdaSigningScheme);
  if (value === undefined) {
    throw new Error('Unknown schema ' + ecdaSigningScheme);
  }

  return value;
}

export function getSigningSchemeApiValue(
  ecdaSigningScheme: EcdsaSigningScheme
) {
  return _getSigningSchemeInfo(ecdaSigningScheme).apiValue;
}

export function getSigningSchemeLibValue(
  ecdaSigningScheme: EcdsaSigningScheme
) {
  return _getSigningSchemeInfo(ecdaSigningScheme).libraryValue;
}

async function _signOrder(params: SignOrderParams): Promise<Signature> {
  const { signer, order, signingScheme } = params;

  const domain = domainGp(networkId.value, GP_SETTLEMENT_CONTRACT_ADDRESS);

  console.log('[Gnosis Signing] signOrder', {
    domain,
    order,
    signer,
  });

  return signOrderGp(
    domain,
    order,
    signer,
    getSigningSchemeLibValue(signingScheme)
  );
}

async function _signOrderCancellation(
  params: SingOrderCancellationParams
): Promise<Signature> {
  const { signer, signingScheme, orderId } = params;

  const domain = domainGp(networkId.value, GP_SETTLEMENT_CONTRACT_ADDRESS);

  console.log('[Gnosis Signing] signOrderCancellation', {
    domain,
    orderId,
    signer,
  });

  return signOrderCancellationGp(
    domain,
    orderId,
    signer,
    getSigningSchemeLibValue(signingScheme)
  );
}

type SigningResult = { signature: string; signingScheme: EcdsaSigningScheme };

async function _signPayload(
  payload: any,
  signFn: typeof _signOrder | typeof _signOrderCancellation,
  signer: Signer,
  signingMethod: 'v4' | 'int_v4' | 'v3' | 'eth_sign' = 'v4'
): Promise<SigningResult> {
  const signingScheme =
    signingMethod === 'eth_sign' ? SigningScheme.ETHSIGN : SigningScheme.EIP712;
  let signature: Signature | null = null;

  let _signer;
  try {
    switch (signingMethod) {
      case 'v3':
        _signer = new TypedDataV3Signer(signer);
        break;
      case 'int_v4':
        _signer = new IntChainIdTypedDataV4Signer(signer);
        break;
      default:
        _signer = signer;
    }
  } catch (e) {
    console.error('Wallet not supported:', e);
    throw new Error('Wallet not supported');
  }

  try {
    signature = (await signFn({
      ...payload,
      signer: _signer,
      signingScheme,
    })) as EcdsaSignature; // Only ECDSA signing supported for now
  } catch (e) {
    const error = e as WalletError;
    if (
      error.code === METHOD_NOT_FOUND_ERROR_CODE ||
      RPC_REQUEST_FAILED_REGEX.test(error.message)
    ) {
      // Maybe the wallet returns the proper error code? We can only hope 🤞
      // OR it failed with a generic message, there's no error code set, and we also hope it'll work
      // with other methods...
      switch (signingMethod) {
        case 'v4':
          return _signPayload(payload, signFn, signer, 'v3');
        case 'v3':
          return _signPayload(payload, signFn, signer, 'eth_sign');
        default:
          throw e;
      }
    } else if (METAMASK_STRING_CHAINID_REGEX.test(error.message)) {
      // Metamask now enforces chainId to be an integer
      return _signPayload(payload, signFn, signer, 'int_v4');
    } else if (error.code === METAMASK_SIGNATURE_ERROR_CODE) {
      // We tried to sign order the nice way.
      // That works fine for regular MM addresses. Does not work for Hardware wallets, though.
      // See https://github.com/MetaMask/metamask-extension/issues/10240#issuecomment-810552020
      // So, when that specific error occurs, we know this is a problem with MM + HW.
      // Then, we fallback to ETHSIGN.
      return _signPayload(payload, signFn, signer, 'eth_sign');
    } else if (V4_ERROR_MSG_REGEX.test(error.message)) {
      // Failed with `v4`, and the wallet does not set the proper error code
      return _signPayload(payload, signFn, signer, 'v3');
    } else if (V3_ERROR_MSG_REGEX.test(error.message)) {
      // Failed with `v3`, and the wallet does not set the proper error code
      return _signPayload(payload, signFn, signer, 'eth_sign');
    } else {
      // Some other error signing. Let it bubble up.
      console.error(error);
      throw error;
    }
  }
  return { signature: signature.data.toString(), signingScheme };
}

export async function signOrder(
  order: UnsignedOrder,
  signer: Signer
): Promise<SigningResult> {
  return _signPayload({ order }, _signOrder, signer);
}

export async function signOrderCancellation(
  orderId: string,
  signer: Signer
): Promise<SigningResult> {
  return _signPayload({ orderId }, _signOrderCancellation, signer);
}
