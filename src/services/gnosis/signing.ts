import { APP_NETWORK_ID } from '@/constants/network';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';

import {
  domain as domainGp,
  signOrder as signOrderGp,
  Order,
  EcdsaSigningScheme,
  Signature,
  SigningScheme,
  EcdsaSignature,
  TypedDataV3Signer
} from '@gnosis.pm/gp-v2-contracts';

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from './constants';

// For error codes, see:
// - https://eth.wiki/json-rpc/json-rpc-error-codes-improvement-proposal
// - https://www.jsonrpc.org/specification#error_object
const METAMASK_SIGNATURE_ERROR_CODE = -32603;
const METHOD_NOT_FOUND_ERROR_CODE = -32601;
const V4_ERROR_MSG_REGEX = /eth_signTypedData_v4 does not exist/i;
const V3_ERROR_MSG_REGEX = /eth_signTypedData_v3 does not exist/i;
const RPC_REQUEST_FAILED_REGEX = /RPC request failed/i;
const MAX_VALID_TO_EPOCH = BigNumber.from('0xFFFFFFFF').toNumber(); // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)

export type UnsignedOrder = Omit<Order, 'receiver'> & { receiver: string };

export interface SignOrderParams {
  signer: Signer;
  order: UnsignedOrder;
  signingScheme: EcdsaSigningScheme;
}

// posted to /api/v1/orders on Order creation
// serializable, so no BigNumbers
//  See https://protocol-rinkeby.dev.gnosisdev.com/api/
export interface OrderCreation extends UnsignedOrder {
  signature: string; // 65 bytes encoded as hex without `0x` prefix. v + r + s from the spec
  signingScheme: EcdsaSigningScheme; // value of
}

interface SchemaInfo {
  libraryValue: number;
  apiValue: string;
}
const mapSigningSchema: Map<SigningScheme, SchemaInfo> = new Map([
  [SigningScheme.EIP712, { libraryValue: 0, apiValue: 'eip712' }],
  [SigningScheme.ETHSIGN, { libraryValue: 1, apiValue: 'ethsign' }]
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

  const domain = domainGp(APP_NETWORK_ID, GP_SETTLEMENT_CONTRACT_ADDRESS);
  console.log('[Gnosis Signing] signOrder', {
    domain,
    order,
    signer
  });

  return signOrderGp(
    domain,
    order,
    // @ts-ignore
    signer,
    getSigningSchemeLibValue(signingScheme)
  );
}

export async function signOrder(
  unsignedOrder: UnsignedOrder,
  signer: Signer,
  signingMethod: 'v4' | 'v3' | 'eth_sign' = 'v4'
): Promise<{ signature: string; signingScheme: EcdsaSigningScheme }> {
  const signingScheme =
    signingMethod === 'eth_sign' ? SigningScheme.ETHSIGN : SigningScheme.EIP712;
  let signature: Signature | null = null;

  let _signer = signer;
  try {
    // @ts-ignore
    _signer = signingMethod === 'v3' ? new TypedDataV3Signer(signer) : signer;
  } catch (e) {
    console.error('Wallet not supported:', e);
    throw new Error('Wallet not supported');
  }

  const signatureParams: SignOrderParams = {
    signer: _signer,
    order: unsignedOrder,
    signingScheme
  };

  try {
    signature = (await _signOrder(signatureParams)) as EcdsaSignature; // Only ECDSA signing supported for now
  } catch (e) {
    if (
      e.code === METHOD_NOT_FOUND_ERROR_CODE ||
      RPC_REQUEST_FAILED_REGEX.test(e.message)
    ) {
      // Maybe the wallet returns the proper error code? We can only hope 🤞
      // OR it failed with a generic message, there's no error code set, and we also hope it'll work
      // with other methods...
      switch (signingMethod) {
        case 'v4':
          return signOrder(unsignedOrder, signer, 'v3');
        case 'v3':
          return signOrder(unsignedOrder, signer, 'eth_sign');
        default:
          throw e;
      }
    } else if (e.code === METAMASK_SIGNATURE_ERROR_CODE) {
      // We tried to sign order the nice way.
      // That works fine for regular MM addresses. Does not work for Hardware wallets, though.
      // See https://github.com/MetaMask/metamask-extension/issues/10240#issuecomment-810552020
      // So, when that specific error occurs, we know this is a problem with MM + HW.
      // Then, we fallback to ETHSIGN.
      return signOrder(unsignedOrder, signer, 'eth_sign');
    } else if (V4_ERROR_MSG_REGEX.test(e.message)) {
      // Failed with `v4`, and the wallet does not set the proper error code
      return signOrder(unsignedOrder, signer, 'v3');
    } else if (V3_ERROR_MSG_REGEX.test(e.message)) {
      // Failed with `v3`, and the wallet does not set the proper error code
      return signOrder(unsignedOrder, signer, 'eth_sign');
    } else {
      // Some other error signing. Let it bubble up.
      console.error(e);
      throw e;
    }
  }
  return { signature: signature.data.toString(), signingScheme };
}

export function calculateValidTo(deadlineInMinutes: number): number {
  const now = Date.now() / 1000;
  const validTo = Math.floor(deadlineInMinutes * 60 + now);

  return Math.min(validTo, MAX_VALID_TO_EPOCH);
}
