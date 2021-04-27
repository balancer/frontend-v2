<template>
  <a
    href="https://docs.balancer.finance/core-concepts/bal-balancer-governance-token/bal-for-gas"
    target="_blank"
    class="message-link"
  >
    <div v-if="isActive()" class="message">
      <div>
        <span class="header"> High gas fees? Here's a helping hand<br /> </span>
        <span class="body">
          {{ text }}
        </span>
      </div>
    </div>
  </a>
</template>

<script lang="ts">
import { PropType, defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { ETHER } from '@/constants/tokenlists';
import BigNumber from 'bignumber.js';
import { SorReturn } from '@/utils/balancer/helpers/sor/sorManager';

import eligibleAssetList from '@balancer-labs/assets/lists/eligible.json';

const NETWORK = process.env.VUE_APP_NETWORK || '1';
const networkMap = {
  '1': 'homestead',
  '42': 'kovan'
};

export default defineComponent({
  props: {
    addressIn: {
      type: String,
      required: true
    },
    addressOut: {
      type: String,
      required: true
    },
    sorReturn: {
      type: Object as PropType<SorReturn>,
      required: true
    }
  },

  setup(props) {
    const store = useStore();

    const eligibleAssetMeta = eligibleAssetList[networkMap[NETWORK]];
    const eligibleAssets = Object.fromEntries(
      Object.entries(eligibleAssetMeta).map(assetEntry => {
        const [address] = assetEntry;
        return [address.toLowerCase(), ''];
      })
    );

    const reimburseAmount = computed(() => {
      // If no swaps set costs to 0 so no price shown
      if (!props.sorReturn.hasSwaps) {
        return {
          bal: new BigNumber(0),
          usd: new BigNumber(0)
        };
      }

      const ethPrice =
        store.state.market.prices[ETHER.address.toLowerCase()]?.price || 0;
      const balPrice =
        store.state.market.prices['0xba100000625a3754423978a60c9317c58a424e3d']
          ?.price || 0;
      const gasPrice = store.state.market.prices['gas']?.price || 0;

      const addressInIsEligible =
        props.addressIn === ETHER.address ||
        props.addressIn.toLowerCase() in eligibleAssets;
      const addressOutIsEligible =
        props.addressOut === ETHER.address ||
        props.addressOut.toLowerCase() in eligibleAssets;
      const reimburseAllSwaps = addressInIsEligible && addressOutIsEligible;

      if (props.sorReturn.isV1swap) {
        let numSwaps = props.sorReturn.v1result[0].flat().length;
        if (!reimburseAllSwaps) {
          const eligibleSwaps = props.sorReturn.v1result[0]
            .flat()
            .filter(hop => {
              return (
                hop.tokenIn in eligibleAssets && hop.tokenOut in eligibleAssets
              );
            });

          numSwaps = eligibleSwaps.length;
        }
        const gasLimit =
          numSwaps === 1
            ? 130000
            : numSwaps === 2
            ? 220000
            : numSwaps === 3
            ? 300000
            : numSwaps >= 4
            ? 400000
            : 0;
        const gasLimitNumber = new BigNumber(gasLimit);
        const gasCostWei = gasLimitNumber.times(gasPrice);
        const gasCost = gasCostWei.div(1e18);
        return {
          bal: gasCost.times(ethPrice).div(balPrice),
          usd: gasCost.times(ethPrice)
        };
      } else {
        let numSwaps = props.sorReturn.v2result.swaps.length;
        if (!reimburseAllSwaps) {
          const tokensList = props.sorReturn.v2result.tokenAddresses;
          numSwaps = 0;
          props.sorReturn.v2result.swaps.forEach(swap => {
            if (
              tokensList[swap.assetInIndex] in eligibleAssets &&
              tokensList[swap.assetOutIndex] in eligibleAssets
            )
              numSwaps++;
          });
        }
        // TO DO - What should the swap costs be for V2?
        const gasLimit =
          numSwaps === 1
            ? 100000
            : numSwaps === 2
            ? 200000
            : numSwaps === 3
            ? 300000
            : numSwaps >= 4
            ? 400000
            : 0;
        const gasLimitNumber = new BigNumber(gasLimit);
        const gasCostWei = gasLimitNumber.times(gasPrice);
        const gasCost = gasCostWei.div(1e18);
        return {
          bal: gasCost.times(ethPrice).div(balPrice),
          usd: gasCost.times(ethPrice)
        };
      }
    });

    const text = computed(() => {
      const isEligible =
        reimburseAmount.value && reimburseAmount.value.usd.gt(0);

      return isEligible
        ? `This trade earns you ~${reimburseAmount.value.bal.toFixed(
            1,
            BigNumber.ROUND_DOWN
          )} BAL (${formatUSD(reimburseAmount.value.usd)})`
        : 'Earn BAL when swapping eligible tokens';
    });

    function formatUSD(amount: BigNumber): string {
      return `$${new BigNumber(amount).toFixed(2)}`;
    }

    function isActive(): boolean {
      return NETWORK === '1' && store.state.balForGas.isBudgetLeft;
    }

    return {
      text,
      isActive
    };
  }
});
</script>

<style scoped>
.message-link {
  text-decoration: none;
}

.message {
  position: relative;
  padding: 20px 30px;
  border-radius: var(--border-radius-medium);
  color: var(--text-primary);
  background: linear-gradient(185deg, #f0f 0%, #00f 100%);
}

.message::before {
  content: '🤝';
  position: absolute;
  top: 2px;
  left: 2px;
  bottom: 2px;
  right: 2px;
  padding: 20px;
  border-radius: var(--border-radius-medium);
  text-align: left;
  font-size: 32px;
  background: var(--background-control);
}

.header {
  font-size: var(--font-size-medium);
  font-weight: bold;
  color: var(--text-primary);
}

.body {
  color: var(--text-secondary);
  font-size: var(--font-size-small);
}

.header,
.body {
  margin-left: 36px;
  position: relative;
}

@media only screen and (max-width: 768px) {
  .message {
    width: initial;
  }
}
</style>
