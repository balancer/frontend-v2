import GaugeControllerService from '@/services/contracts/gauge-controller.service';
import { BigNumber } from '@ethersproject/bignumber';
import { mountComposableWithDefaultTokensProvider as mountComposable } from '@tests/mount-helpers';
import { randomAddress } from '@tests/unit/builders/address';
import { silenceConsoleLog } from '@tests/unit/console';
import { times } from 'lodash';
import {
  getTransactionDetails,
  getTransactionSummaryMsg,
  useVotingActions,
  ConfirmedVotingRequest,
  UseVotingActionParams,
} from './useVotingActions';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';

silenceConsoleLog(vi, message => message.startsWith('Voting'));

function mountVotingActions(props: UseVotingActionParams) {
  const { result } = mountComposable(() => useVotingActions(props));
  return result;
}

const expiredGaugeAddress = randomAddress();
const expiredGaugeAddress2 = randomAddress();
const expiredGauges = [expiredGaugeAddress, expiredGaugeAddress2];

const expiredGaugeVote = aVote({ gaugeAddress: expiredGaugeAddress });

const defaultTransactionResponse: TransactionResponse = {
  hash: 'test Hash',
} as unknown as TransactionResponse;

function mockGaugeControllerService() {
  return {
    voteForManyGaugeWeights: vi.fn(async () => defaultTransactionResponse),
  } as unknown as GaugeControllerService;
}

function aVote(options?: Partial<{ gaugeAddress: string; weight: string }>) {
  const defaultVote = {
    gaugeAddress: randomAddress(),
    weight: '10',
  };
  return Object.assign({}, defaultVote, options);
}

function createSingleVotingAction(
  request: ConfirmedVotingRequest,
  service = mockGaugeControllerService()
) {
  const { votingActions } = mountVotingActions({
    request,
    expiredGauges,
    gaugeControllerService: service,
  });
  expect(votingActions).toHaveLength(1);
  return votingActions[0];
}

function createVotingActions(
  request: ConfirmedVotingRequest,
  service = mockGaugeControllerService()
) {
  const { votingActions } = mountVotingActions({
    request,
    expiredGauges,
    gaugeControllerService: service,
  });
  expect(votingActions).toHaveLength(2);
  return votingActions;
}

initDependenciesWithDefaultMocks();

describe('Action label', () => {
  test('when there is only one expired pool selected', () => {
    const request = [expiredGaugeVote];

    const action = createSingleVotingAction(request);

    expect(action.label).toBe('Remove vote');
  });

  test('when there are only expired pools selected', () => {
    const request = [expiredGaugeVote, expiredGaugeVote];

    const action = createSingleVotingAction(request);

    expect(action.label).toBe('Remove votes');
  });

  test('when there is only one alive pool selected', () => {
    const request = [aVote()];

    const action = createSingleVotingAction(request);

    expect(action.label).toBe('Confirm vote');
  });

  test('when there are multiple pools selected', () => {
    const request = [aVote(), aVote()];

    const action = createSingleVotingAction(request);

    expect(action.label).toBe('Confirm votes');
  });
});

describe('creates step tooltips', () => {
  test('when there are 9 pools selected', () => {
    const request = times(9, () => aVote());

    const votingActions = createVotingActions(
      request,
      mockGaugeControllerService()
    );
    expect(votingActions.length).toBe(2);

    expect(votingActions[0].stepTooltip).toBe('Confirm first batch of votes');
    expect(votingActions[1].stepTooltip).toBe('Confirm second batch of votes');
  });
});

const formatCallParams = mock => {
  const params = mock.mock.calls[0] as [string[], BigNumber[]];

  return {
    gaugeAddresses: params[0],
    formattedWeights: params[1].map(weight => weight.toNumber()),
  };
};

test('Fills remaining votes with zeros when there is only one vote in the request', async () => {
  const vote = aVote({ weight: '10' });
  const request = [vote];
  const gaugeControllerService = mockGaugeControllerService();

  const votingAction = createSingleVotingAction(
    request,
    gaugeControllerService
  );

  await votingAction.action();

  expect(gaugeControllerService.voteForManyGaugeWeights).toBeCalledTimes(1);
  const params = formatCallParams(
    gaugeControllerService.voteForManyGaugeWeights
  );

  // Fills 7 addresses with zeros
  expect(params.gaugeAddresses).toEqual([
    vote.gaugeAddress,
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
  ]);

  // Fills 7 weights with zeros
  expect(params.formattedWeights).toEqual([1000, 0, 0, 0, 0, 0, 0, 0]);
});

test('submits first batch from 9 votes', async () => {
  const request = times(9, () => aVote());
  // Explicit change second vote
  request[1].weight = '15';

  const gaugeControllerService = mockGaugeControllerService();

  const firstAction = createVotingActions(request, gaugeControllerService)[0];

  await firstAction.action();

  expect(gaugeControllerService.voteForManyGaugeWeights).toBeCalledTimes(1);
  const params = formatCallParams(
    gaugeControllerService.voteForManyGaugeWeights
  );

  expect(params.gaugeAddresses).toEqual(
    request.slice(0, 8).map(vote => vote.gaugeAddress)
  );
  expect(params.formattedWeights).toEqual([
    1000, 1500, 1000, 1000, 1000, 1000, 1000, 1000,
  ]);
});

test('submits second batch from 9 votes', async () => {
  const request = times(9, () => aVote({ weight: '20' }));

  const gaugeControllerService = mockGaugeControllerService();

  const secondAction = createVotingActions(request, gaugeControllerService)[1];

  await secondAction.action();

  expect(gaugeControllerService.voteForManyGaugeWeights).toBeCalledTimes(1);
  const params = formatCallParams(
    gaugeControllerService.voteForManyGaugeWeights
  );

  expect(params.gaugeAddresses).toEqual([
    request[8].gaugeAddress,
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
  ]);
  expect(params.formattedWeights).toEqual([
    2000, // 20% in bps
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]);
});

describe('Transaction message and details', () => {
  test('when voting request has 3 pools', () => {
    const request = times(3, () => aVote({ weight: '10' }));

    expect(getTransactionSummaryMsg(request)).toBe('Voting on 3 pools');
    expect(getTransactionDetails(request)).toEqual({
      gaugeAddresses: [
        request[0].gaugeAddress,
        request[1].gaugeAddress,
        request[2].gaugeAddress,
      ],
      votes: ['10', '10', '10'],
    });
  });
});
