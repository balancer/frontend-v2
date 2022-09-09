import { computed, reactive } from 'vue';
import useGraphQuery, { subgraphs } from '@/composables/queries/useGraphQuery';
import useWeb3 from '@/services/web3/useWeb3';
import useConfig from '@/composables/useConfig';
import { isSameAddress } from '@/lib/utils';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import useVotingGauges from '@/composables/useVotingGauges';
import configs from '@/lib/config';
import { networkId } from '@/composables/useNetwork';
import useExpiredGaugesQuery from '@/composables/queries/useExpiredGaugesQuery';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import { getNextAllowedTimeToVote } from '@/components/contextual/pages/vebal/LMVoting/utils';

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
  /**
   * COMPOSABLES
   */
  const { account } = useWeb3();
  const { networkConfig } = useConfig();
  const veBalLockInfoQuery = useVeBalLockInfoQuery();
  const { votingGauges: allVotingGauges } = useVotingGauges();

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

  const votingGaugeAddresses = computed<string[]>(
    () => allVotingGauges.value?.map(gauge => gauge.address) || []
  );

  const { data: expiredGauges } = useExpiredGaugesQuery(votingGaugeAddresses);

  //  If user has received more veBAL since they last voted, their voting power is under-utilized
  const gaugesUsingUnderUtilizedVotingPower = computed<VotingGaugeWithVotes[]>(
    () =>
      allVotingGauges.value.reduce<VotingGaugeWithVotes[]>((acc, gauge) => {
        if (
          // Does the gauge have user votes
          Number(gauge.userVotes) &&
          // Has user received veBAL since they last voted
          gauge.lastUserVoteTime < lastReceivedVebal.value &&
          // Is voting currently locked
          !getNextAllowedTimeToVote(gauge.lastUserVoteTime) &&
          // Is gauge not expired
          !expiredGauges.value?.includes(gauge.address)
        ) {
          return [...acc, gauge];
        }
        return acc;
      }, [])
  );

  const shouldResubmitVotes = computed<boolean>(
    () => !!gaugesUsingUnderUtilizedVotingPower.value.length
  );

  const lastReceivedVebal = computed(
    () =>
      votingEscrowLocks.value?.find(item =>
        isSameAddress(item.votingEscrowID.id, networkConfig.addresses.veBAL)
      )?.updatedAt || 0
  );

  return {
    votingEscrowLocks,
    lastReceivedVebal,
    gaugesUsingUnderUtilizedVotingPower,
    shouldResubmitVotes,
  };
}
