import { computed, reactive, toRefs } from 'vue';
import { isDateCheck, isTimeCheck, isUrlCheck } from '@/lib/utils/validations';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import { LgeData } from '@/beethovenx/lbp/lbp-types';
import { PoolTokenInput } from '@/beethovenx/services/pool/creator/pool-creator.service';
import { format, formatInTimeZone, utcToZonedTime } from 'date-fns-tz';
import { toUtcTime } from '@/lib/utils/date';

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
  lbpCreateTriggered: boolean;
  createTransactionHash: string;
}

export const LBPDefaultData: LgeData = {
  name: '',
  websiteUrl: '',
  tokenContractAddress: '',
  tokenIconUrl: '',
  twitterUrl: '',
  mediumUrl: '',
  discordUrl: '',
  telegramUrl: '',
  description: '',

  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  collateralTokenAddress: '',
  tokenAmount: '',
  collateralAmount: '',
  tokenStartWeight: 95,
  collateralStartWeight: 5,
  tokenEndWeight: 50,
  collateralEndWeight: 50,
  swapFeePercentage: 2.5,
  poolName: '',
  poolSymbol: '',
  bannerImageUrl: ''
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
  lgeSaved: false,
  createTransactionHash: '',
  lbpCreateTriggered: false
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

  const lgeChartConfigValid = computed(() => {
    const now = new Date();
    const today = formatInTimeZone(now, 'UTC', 'yyyy-MM-dd');
    const nowTime = formatInTimeZone(now, 'UTC', 'HH:mm');
    const data = state.data;

    if (
      !isDateCheck(data.startDate) ||
      !isDateCheck(data.endDate) ||
      !isTimeCheck(data.startTime) ||
      !isTimeCheck(data.endTime)
    ) {
      return 'Invalid date provided';
    }

    if (
      data.startDate < today ||
      (data.startDate === today && data.startTime < nowTime)
    ) {
      return 'Start date is in the past';
    }

    if (data.startDate > data.endDate) {
      return 'End date is before start date';
    }

    //same date, time needs to be after
    if (data.startDate === data.endDate && data.startTime >= data.endTime) {
      return 'End date/time is before start date/time';
    }

    if (data.tokenAmount === '' || parseFloat(data.tokenAmount) === 0) {
      return 'Missing token amount';
    }

    if (
      data.collateralAmount === '' ||
      parseFloat(data.collateralAmount) === 0
    ) {
      return 'Missing collateral amount';
    }

    return true;
  });

  const lgeConfigValid = computed(() => {
    const data = state.data;

    if (lgeChartConfigValid.value !== true) {
      console.log('lgeChartConfigValid not valid');
      return false;
    }

    if (data.swapFeePercentage < 0.0001 || data.swapFeePercentage > 10) {
      console.log('swapFeePercentage not valid');
      return false;
    }

    if (data.poolName === '' || data.poolSymbol === '') {
      console.log('swapFepoolNameePercentage not valid');
      return false;
    }

    if (state.tokenRequiresApproval || state.collateralTokenRequiresApproval) {
      console.log('tokenRequiresApproval not valid');
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
    reviewAndDeployOpen,
    lgeChartConfigValid
  };
}
