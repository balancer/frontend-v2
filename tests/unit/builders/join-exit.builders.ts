import { AmountOut } from '@/providers/local/exit-pool.provider';
import { AmountIn } from '@/providers/local/join-pool.provider';
import { ExitParams } from '@/services/balancer/pools/exits/handlers/exit-pool.handler';
import { JoinParams } from '@/services/balancer/pools/joins/handlers/join-pool.handler';
import { aTokenInfo } from '@/types/TokenList.builders';
import { defaultWeightedPoolAddress } from '@/__mocks__/weighted-pool';
import { mock } from 'vitest-mock-extended';
import { wethAddress } from './address';
import { aSigner } from './signer';

export function anAmountOut(...options: Partial<AmountOut>[]): AmountOut {
  const defaultAmountOut: AmountOut = {
    address: wethAddress,
    valid: true,
    max: '100',
    value: '10',
  };
  return Object.assign(defaultAmountOut, ...options);
}

export function anAmountIn(...options: Partial<AmountIn>[]): AmountIn {
  const defaultAmountIn: AmountIn = {
    address: wethAddress,
    valid: true,
    value: '20',
  };
  return Object.assign(defaultAmountIn, ...options);
}

export function buildExitParams(...options: Partial<ExitParams>[]): ExitParams {
  const defaultExitParams = mock<ExitParams>();

  defaultExitParams.amountsOut = [anAmountOut({ address: wethAddress })];

  defaultExitParams.tokenInfo = {
    // This will be parametrized in incoming PRs:
    [defaultWeightedPoolAddress]: aTokenInfo(),
    [wethAddress]: aTokenInfo(),
  };

  defaultExitParams.signer = aSigner();

  return Object.assign(defaultExitParams, ...options);
}

export function buildJoinParams(...options: Partial<JoinParams>[]): JoinParams {
  const defaultJoinParams = mock<JoinParams>();

  defaultJoinParams.amountsIn = [];

  defaultJoinParams.signer = aSigner();

  return Object.assign(defaultJoinParams, ...options);
}
