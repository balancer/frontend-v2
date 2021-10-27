import { ref, reactive, toRefs, watch } from 'vue';

export type TokenWeight = {
  tokenAddress: string;
  weight: number;
  isLocked: boolean;
  id: number;
};

type FeeManagementType = 'governance' | 'fixed' | 'address' | 'self';

const poolCreationState = reactive({
  tokenWeights: [] as TokenWeight[],
  activeStep: 0,
  initialFee: '0',
  isFeeGovManaged: false,
  feeManagementType: 'governance' as FeeManagementType,
  thirdPartyFeeController: ''
});

export default function usePoolCreation() {
  const updateTokenWeights = (weights: TokenWeight[]) => {
    poolCreationState.tokenWeights = weights;
  };

  const proceed = () => {
    poolCreationState.activeStep += 1;
  };

  const setFeeManagement = (type: FeeManagementType) => {
    poolCreationState.feeManagementType = type;
  }

  watch(() => poolCreationState.feeManagementType, () => {
      console.log('esh', poolCreationState.feeManagementType)
  })

  return {
    ...toRefs(poolCreationState),
    updateTokenWeights,
    proceed,
    setFeeManagement
  };
}
