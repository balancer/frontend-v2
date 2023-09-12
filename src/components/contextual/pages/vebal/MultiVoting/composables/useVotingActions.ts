import {
  hasOnlyExpiredPools,
  sharesToBps,
} from '@/components/contextual/pages/vebal/voting-utils';
import { POOLS } from '@/constants/pools';
import GaugeControllerService, {
  gaugeControllerService as gaugeControllerServiceInstance,
} from '@/services/contracts/gauge-controller.service';
import { TransactionActionInfo } from '@/types/transactions';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { useVotingTransactionState } from './useVotingTransactionState';
import useTransactions from '@/composables/useTransactions';
import { setVotingCompleted } from '../../providers/voting.provider';

export type ConfirmedVotingRequest = {
  gaugeAddress: string;
  weight: string;
}[];

export type VotingActionProps = {
  request: ConfirmedVotingRequest;
  expiredGauges?: readonly string[];
};

export type UseVotingActionParams = VotingActionProps & {
  gaugeControllerService?: GaugeControllerService;
};

const { txState } = useVotingTransactionState();

export function useVotingActions({
  request,
  expiredGauges,
  gaugeControllerService = gaugeControllerServiceInstance,
}: UseVotingActionParams) {
  const { addTransaction } = useTransactions();

  const votingActions = createVotingActions();

  function createVotingActions(): TransactionActionInfo[] {
    if (request.length > 8) {
      return [createVotingAction(1), createVotingAction(2)];
    }

    return [createVotingAction()];
  }

  function createVotingAction(
    batchNumber: BatchNumber = 1
  ): TransactionActionInfo {
    const requestBatch = buildBatch(request, batchNumber);

    const action = () => submitVotes(requestBatch);
    return {
      label: buildConfirmButtonLabel(request, expiredGauges),
      loadingLabel: 'Confirm voting in wallet',
      confirmingLabel: 'Voting',
      stepTooltip: buildStepTooltip(batchNumber),
      action,
    };
  }

  async function submitVotes(
    requestBatch: ConfirmedVotingRequest
  ): Promise<TransactionResponse> {
    txState.init = true;
    try {
      const tx = await voteForManyGauges(requestBatch, gaugeControllerService);

      txState.confirming = true;

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'voteForGauge',
        summary: getTransactionSummaryMsg(requestBatch),
        details: getTransactionDetails(requestBatch),
      });

      return tx;
    } catch (error) {
      txState.confirming = false;
      console.log(error);
      throw new Error('Failed to submit votes.', {
        cause: error,
      });
    } finally {
      txState.init = false;
    }
  }

  async function handleSuccess(
    receipt: TransactionReceipt,
    confirmedAt: string
  ): Promise<void> {
    console.log('Voting receipt', receipt);
    setVotingCompleted();
    txState.receipt = receipt;
    txState.confirmedAt = confirmedAt;
    txState.confirmed = true;
    txState.confirming = false;
  }

  function handleFailed() {
    txState.confirming = false;
  }

  return {
    txState,
    votingActions,
    handleSuccess,
    handleFailed,
  };
}

type BatchNumber = 1 | 2;

function buildStepTooltip(batchNumber) {
  if (batchNumber === 1) return 'Confirm first batch of votes';
  if (batchNumber === 2) return 'Confirm second batch of votes';
  return '';
}

function buildConfirmButtonLabel(
  request: ConfirmedVotingRequest,
  expiredGauges?: readonly string[]
) {
  if (
    hasOnlyExpiredPools(
      request.map(item => item.gaugeAddress),
      expiredGauges
    )
  ) {
    if (request.length > 1) return 'Remove votes';
    return 'Remove vote';
  }
  if (request.length > 1) return 'Confirm votes';
  return 'Confirm vote';
}

async function voteForManyGauges(
  requestBatch: ConfirmedVotingRequest,
  gaugeControllerService: GaugeControllerService
): Promise<TransactionResponse> {
  // Gauge Controller requires a fixed 8 Gauge Addresses
  // We take the first 8 Voting Gauges
  // If there's less than 8, fill the remaining with Zero Addresses
  const gaugeAddresses: string[] = requestBatch.map(item => item.gaugeAddress);
  const weights: BigNumber[] = requestBatch.map(item =>
    sharesToBps(item.weight)
  );

  const zeroAddresses: string[] = new Array(8 - gaugeAddresses.length).fill(
    POOLS.ZeroAddress
  );
  const zeroWeights: BigNumber[] = new Array(8 - gaugeAddresses.length).fill(
    BigNumber.from(0)
  );
  console.log('Voting:', {
    addresses: [...gaugeAddresses, ...zeroAddresses],
    weights: [
      ...weights.map(weight => weight.toNumber()),
      ...zeroWeights.map(weight => weight.toNumber()),
    ],
  });

  return await gaugeControllerService.voteForManyGaugeWeights(
    [...gaugeAddresses, ...zeroAddresses],
    [...weights, ...zeroWeights]
  );
}

function buildBatch(request: ConfirmedVotingRequest, batchNumber: BatchNumber) {
  const batchSize = 8;
  if (batchNumber === 2) return request.slice(batchSize);
  if (request.length >= batchSize) {
    return request.slice(0, batchSize);
  }
  return request;
}

export function getTransactionSummaryMsg(
  request: ConfirmedVotingRequest
): string {
  return request.length > 1
    ? `Voting on ${request.length} pools`
    : `Voting on 1 pool`;
}

export function getTransactionDetails(request: ConfirmedVotingRequest) {
  return {
    gaugeAddresses: request.map(item => item.gaugeAddress),
    votes: request.map(item => item.weight),
  };
}
