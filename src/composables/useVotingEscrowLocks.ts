import { computed, reactive } from 'vue';
import useGraphQuery, { subgraphs } from '@/composables/queries/useGraphQuery';
import useWeb3 from '@/services/web3/useWeb3';
import useConfig from '@/composables/useConfig';
import { isSameAddress } from '@/lib/utils';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import useVotingGauges from '@/composables/useVotingGauges';
import configs from '@/lib/config';
import { networkId } from '@/composables/useNetwork';

/**
 * TYPES
 */
export type VotingEscrowLock = {
  votingEscrowID: {
    id: string;
  };
  updatedAt: number;
};

type VotingEscrowLockQueryResponse = {
  votingEscrowLocks: VotingEscrowLock[];
};

export default function useVotingEscrowLocks() {
  // const enabled = computed(() => isWalletReady.value && isVeBalSupported.value);

  /**
   * COMPOSABLES
   */
  const { account } = useWeb3();
  const { networkConfig } = useConfig();
  const veBalLockInfoQuery = useVeBalLockInfoQuery();
  const { votingGauges } = useVotingGauges();

  const votingEscrowLocksQueryEnabled = computed(() => !!account.value);
  const votingEscrowLocksQuery = useGraphQuery<VotingEscrowLockQueryResponse>(
    subgraphs.gauge,
    ['votingEscrowLocks', veBalLockInfoQuery.data.value?.lockedAmount],
    () => ({
      votingEscrowLocks: {
        __args: {
          where: {
            user: account.value.toLowerCase(),
            votingEscrowID:
              configs[networkId.value].addresses.veBAL.toLocaleLowerCase(),
          },
        },
        votingEscrowID: {
          id: true,
        },
        updatedAt: true,
      },
    }),
    reactive({ enabled: votingEscrowLocksQueryEnabled })
  );

  /**
   * COMPUTED
   */
  const votingEscrowLocks = computed(
    () => votingEscrowLocksQuery.data.value?.votingEscrowLocks
  );

  // TODO: Explain
  const poolsUsingUnderUtilizedVotingPower = computed<string[]>(() => {
    return votingGauges.value.reduce<string[]>((acc, gauge) => {
      return gauge.lastUserVoteTime < lastReceivedVebal.value
        ? [...acc, gauge.address]
        : acc;
    }, []);
  });

  const shouldResubmitVotes = computed<boolean>(
    () => !!poolsUsingUnderUtilizedVotingPower.value.length
  );

  const lastReceivedVebal = computed(() => {
    return (
      votingEscrowLocks.value?.find(item =>
        isSameAddress(item.votingEscrowID.id, networkConfig.addresses.veBAL)
      )?.updatedAt || 0
    );
  });
  return {
    votingEscrowLocks,
    lastReceivedVebal,
    poolsUsingUnderUtilizedVotingPower,
    shouldResubmitVotes,
  };
}
