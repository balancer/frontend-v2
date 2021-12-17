import { computed, reactive, toRefs } from 'vue';
import { isDateCheck, isTimeCheck, isUrlCheck } from '@/lib/utils/validations';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import { LgeData } from '@/beethovenx/lbp/lbp-types';
import { parseUnits } from '@ethersproject/units';
import { PoolTokenInput } from '@/beethovenx/services/pool/creator/pool-creator.service';

interface LbpState {
  data: LgeData;

  projectDetailsSaved: boolean;
  lgeConfigSaved: boolean;
  loadingToken: boolean;
  creatingLge: boolean;
  fetchingPoolData: boolean;
  poolId: string | null;
  poolAddress: string | null;
  tokenRequiresApproval: boolean;
  collateralTokenRequiresApproval: boolean;
  savingLge: boolean;
  lgeSaved: boolean;
}

export const LBPDefaultData: LgeData = {
  name: 'Beethoven X',
  websiteUrl: 'https://app.beets.fi/',
  tokenContractAddress: '0x6F00D64b42aF8f449dB15B0b3ee3B444550c4826',
  tokenIconUrl:
    'https://beethoven-assets.s3.eu-central-1.amazonaws.com/apple-touch-192.png',
  twitterUrl: 'https://www.twitter.com',
  mediumUrl: 'https://www.twitter.com',
  discordUrl: 'https://www.twitter.com',
  telegramUrl: 'https://www.twitter.com',
  description: 'BEETS',

  startDate: '2022-01-05',
  startTime: '12:00',
  endDate: '2022-01-12',
  endTime: '12:00',
  collateralTokenAddress: '0x70b55af71b29c5ca7e67bd1995250364c4be5554',
  tokenAmount: '100',
  collateralAmount: '',
  tokenStartWeight: 95,
  collateralStartWeight: 5,
  tokenEndWeight: 50,
  collateralEndWeight: 50,
  swapFeePercentage: 2.5,
  poolName: 'Pool Name',
  poolSymbol: 'ABC',
  bannerImageUrl:
    'https://beethoven-assets.s3.eu-central-1.amazonaws.com/masthead-chillin.svg'
};

const state = reactive<LbpState>({
  data: LBPDefaultData,

  projectDetailsSaved: false,
  lgeConfigSaved: false,
  loadingToken: false,
  creatingLge: false,
  fetchingPoolData: false,
  poolId: null,
  poolAddress: null,
  tokenRequiresApproval: false,
  collateralTokenRequiresApproval: false,
  savingLge: false,
  lgeSaved: false
});

export default function useLgeCreateState() {
  const { injectTokens, tokens } = useTokens();

  const projectDetailsValid = computed(() => {
    const data = state.data;

    if (
      !data.name ||
      !data.websiteUrl ||
      !data.tokenContractAddress ||
      !data.tokenIconUrl ||
      !data.description ||
      !isUrlCheck(data.websiteUrl) ||
      !isUrlCheck(data.websiteUrl)
    ) {
      return false;
    }

    return true;
  });

  const lgeConfigOpen = computed(
    () => state.projectDetailsSaved && !state.lgeConfigSaved
  );

  const reviewAndDeployOpen = computed(
    () => state.projectDetailsSaved && state.lgeConfigSaved
  );

  const lgeConfigValid = computed(() => {
    const data = state.data;

    if (
      !isDateCheck(data.startDate) ||
      !isDateCheck(data.endDate) ||
      !isTimeCheck(data.startTime) ||
      !isTimeCheck(data.endTime)
    ) {
      return false;
    }

    if (data.startDate > data.endDate) {
      return false;
    }

    //same date, time needs to be after
    if (data.startDate === data.endDate && data.startTime >= data.endTime) {
      return false;
    }

    if (data.swapFeePercentage < 0.0001 || data.swapFeePercentage > 10) {
      return false;
    }

    if (data.tokenAmount === '' || parseFloat(data.tokenAmount) === 0) {
      return false;
    }

    if (data.poolName === '' || data.poolSymbol === '') {
      return false;
    }

    if (
      data.collateralAmount === '' ||
      parseFloat(data.collateralAmount) === 0
    ) {
      return false;
    }

    if (state.tokenRequiresApproval || state.collateralTokenRequiresApproval) {
      return false;
    }

    return true;
  });

  const poolTokens = computed<PoolTokenInput[]>(() => {
    const {
      tokenContractAddress,
      tokenStartWeight,
      tokenAmount,
      collateralTokenAddress,
      collateralStartWeight,
      collateralAmount
    } = state.data;

    if (!lgeConfigValid.value) {
      return [];
    }

    return [
      {
        address: tokenContractAddress,
        weight: `${tokenStartWeight}`,
        amount: tokenAmount
      },
      {
        address: collateralTokenAddress,
        weight: `${collateralStartWeight}`,
        amount: collateralAmount
      }
    ];
  });

  async function saveProjectDetails() {
    state.loadingToken = true;
    state.data.tokenContractAddress = getAddress(
      state.data.tokenContractAddress
    );

    await injectTokens([state.data.tokenContractAddress]);
    state.lgeConfigSaved = false;
    state.projectDetailsSaved = true;
    state.loadingToken = false;
  }

  function editProjectDetails() {
    if (lgeConfigValid.value && !state.lgeConfigSaved) {
      state.lgeConfigSaved = true;
    }

    state.projectDetailsSaved = false;
  }

  function saveLgeConfig() {
    state.lgeConfigSaved = true;
  }

  function editLgeConfig() {
    state.lgeConfigSaved = false;
  }

  return {
    ...toRefs(state),
    projectDetailsValid,
    lgeConfigOpen,
    saveProjectDetails,
    editProjectDetails,
    lgeConfigValid,
    saveLgeConfig,
    editLgeConfig,
    poolTokens,
    reviewAndDeployOpen
  };
}
