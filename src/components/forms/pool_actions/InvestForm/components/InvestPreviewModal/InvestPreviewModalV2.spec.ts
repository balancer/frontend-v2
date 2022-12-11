import { render, screen, within } from '@testing-library/vue';
import InvestPreviewModalV2 from './InvestPreviewModalV2.vue';
import pool from '@/services/balancer/pools/joins/handlers/__tests__/pool';
import {
  JoinPoolProviderSymbol,
  JoinPoolProvider,
} from '@/providers/local/join-pool.provider';
import { server } from '@/tests/msw/server';
import { rest } from 'msw';

import Web3Plugin from '@/services/web3/web3.plugin';

import { QueryClient, VUE_QUERY_CLIENT } from 'vue-query';
import useJoinPool from '@/composables/pools/useJoinPool';
import blocknative from '@/plugins/blocknative'; // ,{ bnSdkSymbol }
import { h } from 'vue';
import {
  AppProvider,
  TokenListProvider,
  TokensProvider,
  UserSettingsProvider,
} from '@/providers';
// import BlocknativeSdk from 'bnc-sdk';
// import { WebSocketProvider } from '@ethersproject/providers';

import { Multicaller } from '@/lib/utils/balancer/contract';
jest.mock('@ethersproject/providers');
jest.mock('@/services/rpc-provider/rpc-provider.service');
// jest.mock('@/lib/balancer.sdk.ts', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       fetchPoolsForSor: jest.fn(),
//       balancer: { data: {} },
//       hasFetchedPoolsForSor: {
//         value: true,
//       },
//     };
//   });
// });
// jest.setTimeout(10000);
jest.unmock('@/services/web3/useWeb3');
jest.unmock('@/composables/useTokens');
jest.unmock('@/composables/useUserSettings');
// jest.mock('@/composables/useTokens');
// jest.mock('@/composables/useUserSettings', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       currency: 'usd',
//     };
//   });
// });

// Mock token price data
jest.mock('@/lib/balancer.sdk', () => {
  return {
    hasFetchedPoolsForSor: {
      value: true,
    },
    fetchPoolsForSor: jest.fn(),
    balancer: {
      data: {
        tokenPrices: {
          find: async address => {
            const priceData = {
              '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
                usd: '1281.92',
                eth: 0.99977843,
              },
              '0xba100000625a3754423978a60c9317c58a424e3D': {
                usd: '6.04',
                eth: 0.00471244,
              },
              '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': {
                usd: '1.001',
                eth: 0.00078051,
              },
              '0x6B175474E89094C44Da98b954EedeAC495271d0F': {
                usd: '0.99999',
                eth: 0.00077965,
              },
              '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': {
                usd: '17182.67',
                eth: 13.400864,
              },
              '0xdAC17F958D2ee523a2206206994597C13D831ec7': {
                usd: '1',
                eth: 0.00078022,
              },
              '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5': {
                usd: '1',
                eth: 0.00078023,
              },
              '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2': {
                usd: '619.82',
                eth: 0.4834003,
              },
              '0xbC396689893D065F41bc2C6EcbeE5e0085233447': {
                usd: '0.463464',
                eth: 0.00036146,
              },
              '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e': {
                usd: '7030.33',
                eth: 5.482998,
              },
              '0x0d438F3b5175Bebc262bF23753C1E53d03432bDE': {
                usd: '11.17',
                eth: 0.00871326,
              },
              '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828': {
                usd: '1.78',
                eth: 0.00138948,
              },
              '0x514910771AF9Ca656af840dff83E8264EcF986CA': {
                usd: '6.99',
                eth: 0.00545335,
              },
              '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D': {
                usd: '17483.27',
                eth: 13.635308,
              },
              '0x56d811088235F11C8920698a204A5010a788f4b3': {
                usd: '0.03774063',
                eth: 0.00002943,
              },
              '0x476c5E26a75bd202a9683ffD34359C0CC15be0fF': {
                usd: '0.212537',
                eth: 0.00016576,
              },
              '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9': {
                usd: '62.95',
                eth: 0.0490979,
              },
              '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': {
                usd: '6.13',
                eth: 0.00478238,
              },
              '0xad32A8e6220741182940c5aBF610bDE99E737b2D': {
                usd: '0.04823183',
                eth: 0.00003762,
              },
              '0xc00e94Cb662C3520282E6f5717214004A7f26888': {
                usd: '38.24',
                eth: 0.02982058,
              },
              '0xB4EFd85c19999D84251304bDA99E90B92300Bd93': null,
              '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d': {
                usd: '0.02251785',
                eth: 0.00001756,
              },
              '0x0327112423F3A68efdF1fcF402F6c5CB9f7C33fd': {
                usd: '17788.37',
                eth: 13.718663,
              },
              '0x9A48BD0EC040ea4f1D3147C025cd4076A2e71e3e': {
                usd: '5.2e-16',
                eth: 0,
              },
              '0xaD6A626aE2B43DCb1B39430Ce496d2FA0365BA9C': {
                usd: '0.91862',
                eth: 0.00073097,
              },
              '0x78F225869c08d478c34e5f645d07A87d3fe8eb78': {
                usd: '0.836937',
                eth: 0.00066448,
              },
              '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F': {
                usd: '1.88',
                eth: 0.00146939,
              },
              '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51': {
                usd: '1.007',
                eth: 0.00078505,
              },
              '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6': {
                usd: '17340.78',
                eth: 13.51742,
              },
              '0x408e41876cCCDC0F92210600ef50372656052a38': {
                usd: '0.084436',
                eth: 0.00006585,
              },
              '0x0D8775F648430679A709E98d2b0Cb6250d2887EF': {
                usd: '0.227001',
                eth: 0.00017704,
              },
              '0xE41d2489571d322189246DaFA5ebDe1F4699F498': {
                usd: '0.191349',
                eth: 0.00014923,
              },
              '0x3212b29E33587A00FB1C83346f5dBFA69A458923': {
                usd: '16792.41',
                eth: 13.593925,
              },
              '0x5228a22e72ccC52d415EcFd199F99D0665E7733b': {
                usd: '18010.08',
                eth: 14.046171,
              },
              '0x27054b13b1B798B345b591a4d22e6562d47eA75a': {
                usd: '0.101106',
                eth: 0.00007885,
              },
              '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD': {
                usd: '0.245939',
                eth: 0.00019181,
              },
              '0xdd974D5C2e2928deA5F71b9825b8b646686BD200': {
                usd: '0.633324',
                eth: 0.00049393,
              },
              '0x967da4048cD07aB37855c090aAF366e4ce1b9F48': {
                usd: '0.152699',
                eth: 0.00011909,
              },
              '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2': {
                usd: '0.04446522',
                eth: 0.00003468,
              },
              '0xD533a949740bb3306d119CC777fa900bA034cd52': {
                usd: '0.659828',
                eth: 0.0005146,
              },
              '0x58b6A8A3302369DAEc383334672404Ee733aB239': {
                usd: '7.27',
                eth: 0.00567102,
              },
              '0x221657776846890989a759BA2973e427DfF5C9bB': {
                usd: '5.5',
                eth: 0.00429106,
              },
              '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa': {
                usd: '16838.37',
                eth: 13.132348,
              },
              '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd': {
                usd: '1.001',
                eth: 0.0007806,
              },
              '0xD46bA6D942050d489DBd938a2C909A5d5039A161': {
                usd: '1.56',
                eth: 0.00121405,
              },
              '0xf1f955016EcbCd7321c7266BccFB96c68ea5E49b': {
                usd: '0.01006458',
                eth: 0.00000785,
              },
              '0xa117000000f279D81A1D3cc75430fAA017FA5A2e': {
                usd: '2.25',
                eth: 0.00175689,
              },
              '0x20945cA1df56D237fD40036d47E866C7DcCD2114': {
                usd: '0.01264251',
                eth: 0.00000986,
              },
              '0x6810e776880C02933D47DB1b9fc05908e5386b96': {
                usd: '91.42',
                eth: 0.07129981,
              },
              '0xCc80C051057B774cD75067Dc48f8987C4Eb97A5e': {
                usd: '0.03207075',
                eth: 0.00002599,
              },
              '0x8D1ce361eb68e9E05573443C407D4A3Bed23B033': {
                usd: '0.868721',
                eth: 0.00067754,
              },
              '0xfFffFffF2ba8F66D4e51811C5190992176930278': {
                usd: '0.03572044',
                eth: 0.00002786,
              },
              '0x875773784Af8135eA0ef43b5a374AaD105c5D39e': {
                usd: '0.225049',
                eth: 0.00017552,
              },
              '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3': {
                usd: '1.69',
                eth: 0.00131422,
              },
              '0x33349B282065b0284d756F0577FB39c158F935e6': {
                usd: '4.54',
                eth: 0.00354091,
              },
              '0x06Df3b2bbB68adc8B0e302443692037ED9f91b42': null,
              '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32': {
                usd: '1.055',
                eth: 0.00082274,
              },
              '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84': {
                usd: '1267.39',
                eth: 0.98844461,
              },
              '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0': {
                usd: '1393.96',
                eth: 1.08716,
              },
              '0x123151402076fc819B7564510989e475c9cD93CA': {
                usd: '175.32',
                eth: 0.09270377,
              },
              '0xdB25f211AB05b1c97D595516F45794528a807ad8': {
                usd: '1.021',
                eth: 0.00079661,
              },
              '0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7': {
                usd: '0.095686',
                eth: 0.00007463,
              },
              '0xfb5453340C03db5aDe474b27E68B6a9c6b2823Eb': {
                usd: '4.78',
                eth: 0.00377764,
              },
              '0x956F47F50A910163D8BF957Cf5846D573E7f87CA': {
                usd: '0.97055',
                eth: 0.00075694,
              },
              '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B': {
                usd: '0.213134',
                eth: 0.00016622,
              },
              '0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5': {
                usd: '0.217116',
                eth: 0.0001693,
              },
              '0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206': {
                usd: '0.664312',
                eth: 0.0005181,
              },
              '0xA13a9247ea42D743238089903570127DdA72fE44': {
                usd: '1.016',
                eth: 0.00079223,
              },
              '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb': {
                usd: '1.005',
                eth: 0.00078331,
              },
              '0x82698aeCc9E28e9Bb27608Bd52cF57f704BD1B83': {
                usd: '1.002',
                eth: 0.00078098,
              },
              '0xae37D54Ae477268B9997d4161B96b8200755935c': {
                usd: '0.998654',
                eth: 0.0007787,
              },
              '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2': null,
              '0x804CdB9116a10bB78768D3252355a1b18067bF8f': null,
              '0x9210F1204b5a24742Eba12f710636D76240dF3d0': null,
              '0x2BBf681cC4eb09218BEe85EA2a5d3D13Fa40fC0C': null,
              '0x43D4A3cd90ddD2F8f4f693170C9c8098163502ad': {
                usd: '0.0380591',
                eth: 0.00003054,
              },
              '0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198': {
                usd: '0.00848417',
                eth: 0.00000662,
              },
              '0x02d60b84491589974263d922D9cC7a3152618Ef6': {
                usd: '1.008',
                eth: 0.00078483,
              },
              '0xd093fA4Fb80D09bB30817FDcd442d4d02eD3E5de': {
                usd: '1.006',
                eth: 0.00078316,
              },
              '0xf8Fd466F12e236f4c96F7Cce6c79EAdB819abF58': {
                usd: '0.998805',
                eth: 0.00077766,
              },
              '0xD33526068D116cE69F19A9ee46F0bd304F21A51f': {
                usd: '20.17',
                eth: 0.01572927,
              },
              '0xae78736Cd615f374D3085123A210448E74Fc6393': {
                usd: '1379.86',
                eth: 1.076163,
              },
              '0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5': {
                usd: '0.03099122',
                eth: 0.00002417,
              },
              '0xEDB171C18cE90B633DB442f2A6F72874093b49Ef': {
                usd: '5.04',
                eth: 0.0039295,
              },
              '0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5': {
                usd: '9.15',
                eth: 0.00713487,
              },
              '0x10010078a54396F62c96dF8532dc2B4847d47ED3': {
                usd: '0.0243133',
                eth: 0.00001896,
              },
              '0x88ACDd2a6425c3FaAE4Bc9650Fd7E27e0Bebb7aB': {
                usd: '1.61',
                eth: 0.00125745,
              },
              '0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8': {
                usd: '0.055857',
                eth: 0.00004355,
              },
              '0xf2051511B9b121394FA75B8F7d4E7424337af687': {
                usd: '3.22',
                eth: 0.00251402,
              },
              '0xc976BE9DdBB3e2B2eFFd9af4845C38b6195dAB71': null,
              '0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050': {
                usd: '0.02968854',
                eth: 0.00002315,
              },
              '0xAB846Fb6C81370327e784Ae7CbB6d6a6af6Ff4BF': {
                usd: '0.228286',
                eth: 0.00017804,
              },
              '0x12E457a5FC7707d0FDDA849068DF6e664d7a8569': null,
              '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6': {
                usd: '0.408361',
                eth: 0.00031848,
              },
              '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB': {
                usd: '0.073765',
                eth: 0.00005752,
              },
              '0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56': {
                usd: '14.3',
                eth: 0.01113771,
              },
              '0xEd1480d12bE41d92F36f5f7bDd88212E381A3677': {
                usd: '0.00342759',
                eth: 0.00000267,
              },
              '0x333A4823466879eeF910A04D473505da62142069': {
                usd: '746.7',
                eth: 0.58235858,
              },
              '0xF17e65822b568B3903685a7c9F496CF7656Cc6C2': {
                usd: '0.29747',
                eth: 0.000232,
              },
              '0x226f7b842E0F0120b7E194D05432b3fd14773a9D': {
                usd: '0.00031942',
                eth: 2.49116e-7,
              },
              '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF': {
                usd: '2.2',
                eth: 0.00171186,
              },
              '0x616e8BfA43F920657B3497DBf40D6b1A02D4608d': {
                usd: '12.54',
                eth: 0.0097818,
              },
              '0xf203Ca1769ca8e9e8FE1DA9D147DB68B6c919817': {
                usd: '0.068407',
                eth: 0.00005335,
              },
              '0x865377367054516e17014CcdED1e7d814EDC9ce4': {
                usd: '0.99856',
                eth: 0.00077878,
              },
              '0xF24d8651578a55b0C119B9910759a351A3458895': {},
              '0x586Aa273F262909EEF8fA02d90Ab65F5015e0516': {
                usd: '0.997101',
                eth: 0.00080153,
              },
              '0x888888435FDe8e7d4c54cAb67f206e4199454c60': {
                usd: '0.178499',
                eth: 0.00013921,
              },
              '0xBA485b556399123261a5F9c95d413B4f93107407': {
                usd: '2.37',
                eth: 0.0018493,
              },
              '0x798D1bE841a82a273720CE31c822C61a67a601C3': {
                usd: '2670.53',
                eth: 2.082763,
              },
              '0x35e78b3982E87ecfD5b3f3265B601c046cDBe232': {
                usd: '0.113541',
                eth: 0.00008855,
              },
              '0x24A6A37576377F63f194Caa5F518a60f45b42921': {
                usd: '1.58',
                eth: 0.00123283,
              },
              '0x758B4684BE769E92eeFeA93f60DDA0181eA303Ec': {
                usd: '0.00169282',
                eth: 0.00000132,
              },
              '0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6': {
                usd: '0.976384',
                eth: 0.00076149,
              },
              '0x853d955aCEf822Db058eb8505911ED77F175b99e': {
                usd: '1.001',
                eth: 0.00078033,
              },
              '0x8888801aF4d980682e47f1A9036e589479e835C5': {
                usd: '1.14',
                eth: 0.00088925,
              },
              '0x470EBf5f030Ed85Fc1ed4C2d36B9DD02e77CF1b7': {
                usd: '0.973254',
                eth: 0.00075875,
              },
              '0xd084944d3c05CD115C09d072B9F44bA3E0E45921': {
                usd: '13.07',
                eth: 0.01019028,
              },
              '0x9c354503C38481a7A7a51629142963F98eCC12D0': {
                usd: '0.00436323',
                eth: 0.0000034,
              },
              '0xD2af830E8CBdFed6CC11Bab697bB25496ed6FA62': null,
              '0xc55126051B22eBb829D00368f4B12Bde432de5Da': {
                usd: '118.76',
                eth: 0.09260447,
              },
              '0x8D6CeBD76f18E1558D4DB88138e2DeFB3909fAD6': {
                usd: '0.9934',
                eth: 0.00077476,
              },
              '0xf5f06fFa53Ad7F5914F493F16E57B56C8dd2eA80': {
                usd: '0.00167037',
                eth: 0.00000136,
              },
              '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321': {
                usd: '0.85326',
                eth: 0.00066533,
              },
              '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68': {
                usd: '50.95',
                eth: 0.03973932,
              },
              '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B': {
                usd: '1',
                eth: 0.00078016,
              },
              '0xac3E018457B222d93114458476f3E3416Abbe38F': {
                usd: '1292.56',
                eth: 1.006849,
              },
              '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72': {
                usd: '13.75',
                eth: 0.01072412,
              },
              '0x93ef1Ea305D11A9b2a3EbB9bB4FCc34695292E7d': null,
              '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0': {
                usd: '1.037',
                eth: 0.00080867,
              },
              '0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F': {
                usd: '0.057305',
                eth: 0.00004469,
              },
              '0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D': {
                usd: '0.608958',
                eth: 0.00047493,
              },
              '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704': {
                usd: '1245.64',
                eth: 0.97128299,
              },
              '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': {
                eth: 1,
                usd: '1282.44',
              },
              '0xC128a9954e6c874eA3d62ce62B468bA073093F25': null,
            };
            return priceData[address];
          },
        },
      },
    },
  };
});

// Mocking injecting veBAL token metadata
jest.mock('@/lib/utils/balancer/contract');
// @ts-ignore
Multicaller.mockImplementation(() => {
  return {
    call: jest.fn(),
    execute: jest.fn().mockResolvedValue({
      '0xc128a9954e6c874ea3d62ce62b468ba073093f25': {
        address: '0xC128a9954e6c874eA3d62ce62B468bA073093F25',
        chainId: 1,
        decimals: 18,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC128a9954e6c874eA3d62ce62B468bA073093F25/logo.png',
        name: 'Vote Escrowed Balancer BPT',
        symbol: 'veBAL',
      },
    }),
  };
});

// jest.mock('@/lib/utils/balancer/contract.ts', () => {
//   return {
//     Multicaller: {
//       execute: jest.fn().mockResolvedValue({}),
//     },
//   };
// });
jest.mock('@/composables/staking/useStaking', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isPoolEligibleForStaking: true,
    };
  });
});
// jest.mock('bnc-sdk');

// BlocknativeSdk.mockImplementation(() => {
//   return {
//     configuration: jest.fn().mockResolvedValue({}),
//   };
// });

const handlers = [
  rest.post('*/balancer-labs/balancer-v2', (req, res, ctx) => {
    return req.json().then(data => {
      if (data.query.startsWith('query($addresses')) {
        return res(
          ctx.json({
            data: {
              tokens: [
                {
                  address: '0x06df3b2bbb68adc8b0e302443692037ed9f91b42',
                  latestUSDPrice: '1.012959381062061884408085508176257',
                },
                {
                  address: '0x12e457a5fc7707d0fdda849068df6e664d7a8569',
                  latestUSDPrice: '1.676074329756108089557547910294746',
                },
                {
                  address: '0x2bbf681cc4eb09218bee85ea2a5d3d13fa40fc0c',
                  latestUSDPrice: '1.017175276063652518605163758254528',
                },
                {
                  address: '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb2',
                  latestUSDPrice: '1.017835639226539963492056245711271',
                },
                {
                  address: '0x804cdb9116a10bb78768d3252355a1b18067bf8f',
                  latestUSDPrice: '1.012023473396072433685374115856631',
                },
                {
                  address: '0x9210f1204b5a24742eba12f710636d76240df3d0',
                  latestUSDPrice: '1.011085383272096439499978501190106',
                },
                {
                  address: '0x93ef1ea305d11a9b2a3ebb9bb4fcc34695292e7d',
                  latestUSDPrice: null,
                },
                {
                  address: '0xb4efd85c19999d84251304bda99e90b92300bd93',
                  latestUSDPrice: '12.48213702391723535771146576855076',
                },
                {
                  address: '0xf24d8651578a55b0c119b9910759a351a3458895',
                  latestUSDPrice: '17.73830120533834678832091890734948',
                },
              ],
            },
          })
        );
      }
    });
  }),
  // rest.get('https://api.blocknative.com/v0', (req, res, ctx) => {
  //   console.log('mock SSE server hit', req);

  //   return res(
  //     ctx.status(200),
  //     ctx.set('Connection', 'keep-alive'),
  //     ctx.set('Content-Type', 'text/event-stream'),
  //     ctx.json({})
  //   );
  // }),
  // rest.get(
  //   'wss://mainnet.infura.io/ws/v3/daaa68ec242643719749dd1caba2fc66',
  //   (req, res, ctx) => {
  //     console.log('mock infura server hit', req);

  //     return res(
  //       ctx.status(200),
  //       ctx.set('Connection', 'keep-alive'),
  //       ctx.set('Content-Type', 'text/event-stream'),
  //       ctx.json({})
  //     );
  //   }
  // ),

  // rest.get(
  //   'https://api.coingecko.com/api/v3/simple/token_price/ethereum',
  //   (req, res, ctx) => {
  //     return res(
  //       ctx.json({
  //         '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': {
  //           usd: 1341.05,
  //           eth: 1.087527,
  //         },
  //         '0xcc80c051057b774cd75067dc48f8987c4eb97a5e': {
  //           usd: 0.03207075,
  //           eth: 2.599e-5,
  //         },
  //         '0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec': {
  //           usd: 0.209119,
  //           eth: 0.00016959,
  //         },
  //         '0xd33526068d116ce69f19a9ee46f0bd304f21a51f': {
  //           usd: 19.47,
  //           eth: 0.01578525,
  //         },
  //         '0x028171bca77440897b824ca71d1c56cac55b68a3': {
  //           usd: 1.0,
  //           eth: 0.00081054,
  //         },
  //         '0x4e15361fd6b4bb609fa63c81a2be19d873717870': {
  //           usd: 0.233616,
  //           eth: 0.00018945,
  //         },
  //         '0xde30da39c46104798bb5aa3fe8b9e0e1f348163f': {
  //           usd: 1.76,
  //           eth: 0.00142448,
  //         },
  //         '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': {
  //           usd: 5.96,
  //           eth: 0.00483106,
  //         },
  //         '0x11c1a6b3ed6bb362954b29d3183cfa97a0c806aa': {
  //           usd: 0.00346749,
  //           eth: 2.82e-6,
  //         },
  //         '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
  //           usd: 1235.15,
  //           eth: 1.001648,
  //         },
  //         '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
  //           usd: 1.001,
  //           eth: 0.00081182,
  //         },
  //         '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': {
  //           usd: 0.897037,
  //           eth: 0.00072745,
  //         },
  //         '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72': {
  //           usd: 13.46,
  //           eth: 0.01091821,
  //         },
  //         '0xbcca60bb61934080951369a648fb03df4f96263c': {
  //           usd: 1.007,
  //           eth: 0.0008161,
  //         },
  //         '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56': {
  //           usd: 13.87,
  //           eth: 0.01125023,
  //         },
  //         '0x514910771af9ca656af840dff83e8264ecf986ca': {
  //           usd: 6.88,
  //           eth: 0.00558324,
  //         },
  //         '0xd533a949740bb3306d119cc777fa900ba034cd52': {
  //           usd: 0.663116,
  //           eth: 0.00053775,
  //         },
  //         '0x3506424f91fd33084466f402d5d97f05f8e3b4af': {
  //           usd: 0.154081,
  //           eth: 0.00012495,
  //         },
  //         '0x853d955acef822db058eb8505911ed77f175b99e': {
  //           usd: 1.001,
  //           eth: 0.00081148,
  //         },
  //         '0xf5f06ffa53ad7f5914f493f16e57b56c8dd2ea80': {
  //           usd: 0.00167037,
  //           eth: 1.36e-6,
  //         },
  //         '0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6': {
  //           usd: 0.404709,
  //           eth: 0.00032821,
  //         },
  //         '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': {
  //           usd: 1.96,
  //           eth: 0.00158634,
  //         },
  //         '0x8d6cebd76f18e1558d4db88138e2defb3909fad6': {
  //           usd: 0.993412,
  //           eth: 0.00080564,
  //         },
  //         '0x226f7b842e0f0120b7e194d05432b3fd14773a9d': {
  //           usd: 0.00031087,
  //           eth: 2.52098e-7,
  //         },
  //         '0x2f4eb100552ef93840d5adc30560e5513dfffacb': {
  //           usd: 1.005,
  //           eth: 0.0008149,
  //         },
  //         '0x79c71d3436f39ce382d0f58f1b011d88100b9d91': {
  //           usd: 0.00019615,
  //           eth: 1.48184e-7,
  //         },
  //         '0xac3e018457b222d93114458476f3e3416abbe38f': {
  //           usd: 1238.02,
  //           eth: 1.003972,
  //         },
  //         '0x41e5560054824ea6b0732e656e3ad64e20e94e45': {
  //           usd: 0.09739,
  //           eth: 7.898e-5,
  //         },
  //         '0x57ab1ec28d129707052df4df418d58a2d46d5f51': {
  //           usd: 1.006,
  //           eth: 0.00081569,
  //         },
  //         '0xdac17f958d2ee523a2206206994597c13d831ec7': {
  //           usd: 1.0,
  //           eth: 0.00081141,
  //         },
  //         '0xd46ba6d942050d489dbd938a2c909a5d5039a161': {
  //           usd: 1.43,
  //           eth: 0.00116345,
  //         },
  //         '0x0c10bf8fcb7bf5412187a595ab97a3609160b5c6': {
  //           usd: 0.979605,
  //           eth: 0.00079444,
  //         },
  //         '0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c': {
  //           usd: 0.91862,
  //           eth: 0.00073097,
  //         },
  //         '0x9c354503c38481a7a7a51629142963f98ecc12d0': {
  //           usd: 0.00425925,
  //           eth: 3.45e-6,
  //         },
  //         '0x470ebf5f030ed85fc1ed4c2d36b9dd02e77cf1b7': {
  //           usd: 0.964972,
  //           eth: 0.00078254,
  //         },
  //         '0x82698aecc9e28e9bb27608bd52cf57f704bd1b83': {
  //           usd: 1.001,
  //           eth: 0.00081204,
  //         },
  //         '0xae37d54ae477268b9997d4161b96b8200755935c': {
  //           usd: 0.999789,
  //           eth: 0.00081078,
  //         },
  //         '0x6b175474e89094c44da98b954eedeac495271d0f': {
  //           usd: 0.999961,
  //           eth: 0.00081103,
  //         },
  //         '0x408e41876cccdc0f92210600ef50372656052a38': {
  //           usd: 0.087781,
  //           eth: 7.119e-5,
  //         },
  //         '0x0d8775f648430679a709e98d2b0cb6250d2887ef': {
  //           usd: 0.224446,
  //           eth: 0.00018201,
  //         },
  //         '0x5228a22e72ccc52d415ecfd199f99d0665e7733b': {
  //           usd: 17137.74,
  //           eth: 13.897848,
  //         },
  //         '0x586aa273f262909eef8fa02d90ab65f5015e0516': {
  //           usd: 0.996887,
  //           eth: 0.00080843,
  //         },
  //         '0xb62132e35a6c13ee1ee0f84dc5d40bad8d815206': {
  //           usd: 0.668339,
  //           eth: 0.00054199,
  //         },
  //         '0x9a48bd0ec040ea4f1d3147c025cd4076a2e71e3e': {
  //           usd: 5.2e-16,
  //           eth: 0.0,
  //         },
  //         '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b': {
  //           usd: 0.999738,
  //           eth: 0.00081074,
  //         },
  //         '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': {
  //           usd: 61.48,
  //           eth: 0.04985429,
  //         },
  //         '0x967da4048cd07ab37855c090aaf366e4ce1b9f48': {
  //           usd: 0.135725,
  //           eth: 0.00011007,
  //         },
  //         '0xa13a9247ea42d743238089903570127dda72fe44': {
  //           usd: 1.016,
  //           eth: 0.00079223,
  //         },
  //         '0x799ebfabe77a6e34311eeee9825190b9ece32824': {
  //           usd: 0.923459,
  //           eth: 0.00074891,
  //         },
  //         '0xe41d2489571d322189246dafa5ebde1f4699f498': {
  //           usd: 0.185666,
  //           eth: 0.00015057,
  //         },
  //         '0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed': {
  //           usd: 0.154703,
  //           eth: 0.00012546,
  //         },
  //         '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd': {
  //           usd: 0.243606,
  //           eth: 0.00019755,
  //         },
  //         '0x35e78b3982e87ecfd5b3f3265b601c046cdbe232': {
  //           usd: 0.114842,
  //           eth: 9.313e-5,
  //         },
  //         '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab': {
  //           usd: 0.071424,
  //           eth: 5.792e-5,
  //         },
  //         '0x5a98fcbea516cf06857215779fd812ca3bef1b32': {
  //           usd: 1.012,
  //           eth: 0.0008208,
  //         },
  //         '0xba100000625a3754423978a60c9317c58a424e3d': {
  //           usd: 5.82,
  //           eth: 0.00472355,
  //         },
  //         '0x3ed3b47dd13ec9a98b44e6204a523e766b225811': {
  //           usd: 1.001,
  //           eth: 0.00081116,
  //         },
  //         '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
  //           usd: 16791.63,
  //           eth: 13.617173,
  //         },
  //         '0xf2051511b9b121394fa75b8f7d4e7424337af687': {
  //           usd: 3.19,
  //           eth: 0.0025875,
  //         },
  //         '0xba485b556399123261a5f9c95d413b4f93107407': {
  //           usd: 2.31,
  //           eth: 0.00187461,
  //         },
  //         '0x78f225869c08d478c34e5f645d07a87d3fe8eb78': {
  //           usd: 0.836937,
  //           eth: 0.00066448,
  //         },
  //         '0x56d811088235f11c8920698a204a5010a788f4b3': {
  //           usd: 0.03480187,
  //           eth: 2.822e-5,
  //         },
  //         '0x758b4684be769e92eefea93f60dda0181ea303ec': {
  //           usd: 0.00172751,
  //           eth: 1.41e-6,
  //         },
  //         '0xedb171c18ce90b633db442f2a6f72874093b49ef': {
  //           usd: 4.37,
  //           eth: 0.00354177,
  //         },
  //         '0xfb5453340c03db5ade474b27e68b6a9c6b2823eb': {
  //           usd: 4.78,
  //           eth: 0.00377764,
  //         },
  //         '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e': {
  //           usd: 7050.46,
  //           eth: 5.717571,
  //         },
  //         '0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2': {
  //           usd: 0.04292337,
  //           eth: 3.481e-5,
  //         },
  //         '0x44108f0223a3c3028f5fe7aec7f9bb2e66bef82f': {
  //           usd: 0.0491722,
  //           eth: 3.988e-5,
  //         },
  //         '0xf24d8651578a55b0c119b9910759a351a3458895': {},
  //         '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': {
  //           usd: 610.21,
  //           eth: 0.49484973,
  //         },
  //         '0x24a6a37576377f63f194caa5f518a60f45b42921': {
  //           usd: 1.42,
  //           eth: 0.00114934,
  //         },
  //         '0x476c5e26a75bd202a9683ffd34359c0cc15be0ff': {
  //           usd: 0.217094,
  //           eth: 0.00017605,
  //         },
  //         '0xc00e94cb662c3520282e6f5717214004a7f26888': {
  //           usd: 38.25,
  //           eth: 0.03101919,
  //         },
  //         '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c': {
  //           usd: 0.29988,
  //           eth: 0.00024319,
  //         },
  //         '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d': {
  //           usd: 16965.43,
  //           eth: 13.758113,
  //         },
  //         '0x798d1be841a82a273720ce31c822c61a67a601c3': {
  //           usd: 2703.02,
  //           eth: 2.192014,
  //         },
  //         '0x965d79f1a1016b574a62986e13ca8ab04dfdd15c': {
  //           usd: 0.00037592,
  //           eth: 3.04851e-7,
  //         },
  //         '0xcfeaead4947f0705a14ec42ac3d44129e1ef3ed5': {
  //           usd: 0.207706,
  //           eth: 0.00016844,
  //         },
  //         '0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd': {
  //           usd: 17788.37,
  //           eth: 13.718663,
  //         },
  //         '0x8888801af4d980682e47f1a9036e589479e835c5': {
  //           usd: 1.1,
  //           eth: 0.00089563,
  //         },
  //         '0x8d1ce361eb68e9e05573443c407d4a3bed23b033': {
  //           usd: 0.864512,
  //           eth: 0.00068359,
  //         },
  //         '0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198': {
  //           usd: 0.00855575,
  //           eth: 6.94e-6,
  //         },
  //         '0x333a4823466879eef910a04d473505da62142069': {
  //           usd: 709.74,
  //           eth: 0.57556285,
  //         },
  //         '0xab846fb6c81370327e784ae7cbb6d6a6af6ff4bf': {
  //           usd: 0.226535,
  //           eth: 0.00018371,
  //         },
  //         '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d': {
  //           usd: 0.02246911,
  //           eth: 1.822e-5,
  //         },
  //         '0x900db999074d9277c5da2a43f252d74366230da0': {
  //           usd: 0.01995541,
  //           eth: 1.618e-5,
  //         },
  //         '0xed1480d12be41d92f36f5f7bdd88212e381a3677': {
  //           usd: 0.00330809,
  //           eth: 2.68e-6,
  //         },
  //         '0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad': {
  //           usd: 0.03797341,
  //           eth: 3.079e-5,
  //         },
  //         '0x6f80310ca7f2c654691d1383149fa1a57d8ab1f8': {
  //           usd: 0.062292,
  //           eth: 5.052e-5,
  //         },
  //         '0xad32a8e6220741182940c5abf610bde99e737b2d': {
  //           usd: 0.04695471,
  //           eth: 3.808e-5,
  //         },
  //         '0x888888435fde8e7d4c54cab67f206e4199454c60': {
  //           usd: 0.186559,
  //           eth: 0.00015129,
  //         },
  //         '0x865377367054516e17014ccded1e7d814edc9ce4': {
  //           usd: 0.997799,
  //           eth: 0.00080917,
  //         },
  //         '0x68037790a0229e9ce6eaa8a99ea92964106c4703': {
  //           usd: 1.045,
  //           eth: 0.0008476,
  //         },
  //         '0xc7283b66eb1eb5fb86327f08e1b5816b0720212b': {
  //           usd: 0.20785,
  //           eth: 0.00016856,
  //         },
  //         '0x123151402076fc819b7564510989e475c9cd93ca': {
  //           usd: 175.32,
  //           eth: 0.09270377,
  //         },
  //         '0x8daebade922df735c38c80c7ebd708af50815faa': {
  //           usd: 16421.67,
  //           eth: 13.317783,
  //         },
  //         '0xcafe001067cdef266afb7eb5a286dcfd277f3de5': {
  //           usd: 0.03036715,
  //           eth: 2.463e-5,
  //         },
  //         '0x956f47f50a910163d8bf957cf5846d573e7f87ca': {
  //           usd: 0.999532,
  //           eth: 0.00081057,
  //         },
  //         '0xdb25f211ab05b1c97d595516f45794528a807ad8': {
  //           usd: 1.027,
  //           eth: 0.00083318,
  //         },
  //         '0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68': {
  //           usd: 51.71,
  //           eth: 0.0419355,
  //         },
  //         '0x27054b13b1b798b345b591a4d22e6562d47ea75a': {
  //           usd: 0.102556,
  //           eth: 8.317e-5,
  //         },
  //         '0x221657776846890989a759ba2973e427dff5c9bb': {
  //           usd: 5.4,
  //           eth: 0.00438152,
  //         },
  //         '0x8f693ca8d21b157107184d29d398a8d082b38b76': {
  //           usd: 0.02658791,
  //           eth: 2.156e-5,
  //         },
  //         '0xdd974d5c2e2928dea5f71b9825b8b646686bd200': {
  //           usd: 0.624748,
  //           eth: 0.00050664,
  //         },
  //         '0x3301ee63fb29f863f2333bd4466acb46cd8323e6': {
  //           usd: 8.6218e-8,
  //           eth: 6.9921e-11,
  //         },
  //         '0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab': {
  //           usd: 1.54,
  //           eth: 0.00124709,
  //         },
  //         '0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050': {
  //           usd: 0.03129546,
  //           eth: 2.538e-5,
  //         },
  //         '0x81f8f0bb1cb2a06649e51913a151f0e7ef6fa321': {
  //           usd: 0.802122,
  //           eth: 0.00065048,
  //         },
  //         '0x33349b282065b0284d756f0577fb39c158f935e6': {
  //           usd: 4.62,
  //           eth: 0.00374456,
  //         },
  //         '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d': {
  //           usd: 12.33,
  //           eth: 0.01000128,
  //         },
  //         '0xae78736cd615f374d3085123a210448e74fc6393': {
  //           usd: 1320.52,
  //           eth: 1.070877,
  //         },
  //         '0xffffffff2ba8f66d4e51811c5190992176930278': {
  //           usd: 0.03496934,
  //           eth: 2.836e-5,
  //         },
  //         '0x875773784af8135ea0ef43b5a374aad105c5d39e': {
  //           usd: 0.214338,
  //           eth: 0.00017382,
  //         },
  //         '0xa36fdbbae3c9d55a1d67ee5821d53b50b63a1ab9': {
  //           usd: 0.03163259,
  //           eth: 2.565e-5,
  //         },
  //         '0x6810e776880c02933d47db1b9fc05908e5386b96': {
  //           usd: 88.96,
  //           eth: 0.07214043,
  //         },
  //         '0x3ec8798b81485a254928b70cda1cf0a2bb0b74d7': {
  //           usd: 0.097253,
  //           eth: 7.887e-5,
  //         },
  //         '0x45804880de22913dafe09f4980848ece6ecbaf78': {
  //           usd: 1786.52,
  //           eth: 1.448832,
  //         },
  //         '0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d': {
  //           usd: 0.609649,
  //           eth: 0.00049439,
  //         },
  //         '0x04fa0d235c4abf4bcf4787af4cf447de572ef828': {
  //           usd: 1.79,
  //           eth: 0.00145283,
  //         },
  //         '0x20945ca1df56d237fd40036d47e866c7dccd2114': {
  //           usd: 0.01269354,
  //           eth: 1.029e-5,
  //         },
  //         '0x4b13006980acb09645131b91d259eaa111eaf5ba': {
  //           usd: 0.0302809,
  //           eth: 2.456e-5,
  //         },
  //         '0x3affcca64c2a6f4e3b6bd9c64cd2c969efd1ecbe': {
  //           usd: 0.00056936,
  //           eth: 4.61719e-7,
  //         },
  //         '0xf203ca1769ca8e9e8fe1da9d147db68b6c919817': {
  //           usd: 0.067244,
  //           eth: 5.453e-5,
  //         },
  //         '0x10010078a54396f62c96df8532dc2b4847d47ed3': {
  //           usd: 0.02477167,
  //           eth: 2.009e-5,
  //         },
  //         '0x3212b29e33587a00fb1c83346f5dbfa69a458923': {
  //           usd: 16801.68,
  //           eth: 13.600645,
  //         },
  //         '0xd084944d3c05cd115c09d072b9f44ba3e0e45921': {
  //           usd: 13.54,
  //           eth: 0.01097638,
  //         },
  //         '0x58b6a8a3302369daec383334672404ee733ab239': {
  //           usd: 7.25,
  //           eth: 0.00588003,
  //         },
  //         '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6': {
  //           usd: 16901.38,
  //           eth: 13.708158,
  //         },
  //         '0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5': {
  //           usd: 9.1,
  //           eth: 0.00738305,
  //         },
  //         '0xbe9895146f7af43049ca1c1ae358b0541ea49704': {
  //           usd: 1187.69,
  //           eth: 0.96315723,
  //         },
  //         '0x0d438f3b5175bebc262bf23753c1e53d03432bde': {
  //           usd: 10.83,
  //           eth: 0.00878228,
  //         },
  //         '0x31c8eacbffdd875c74b94b077895bd78cf1e64a3': {
  //           usd: 1.65,
  //           eth: 0.00133635,
  //         },
  //         '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd': {
  //           usd: 1.001,
  //           eth: 0.00081205,
  //         },
  //         '0x3472a5a71965499acd81997a54bba8d852c6e53d': {
  //           usd: 2.61,
  //           eth: 0.00212031,
  //         },
  //         '0xc55126051b22ebb829d00368f4b12bde432de5da': {
  //           usd: 117.56,
  //           eth: 0.09533522,
  //         },
  //         '0xf17e65822b568b3903685a7c9f496cf7656cc6c2': {
  //           usd: 0.293485,
  //           eth: 0.00023801,
  //         },
  //         '0xe2f2a5c287993345a840db3b0845fbc70f5935a5': {
  //           usd: 1.0,
  //           eth: 0.00081135,
  //         },
  //         '0x5f98805a4e8be255a32880fdec7f6728c6568ba0': {
  //           usd: 1.038,
  //           eth: 0.00084171,
  //         },
  //         '0xc0c293ce456ff0ed870add98a0828dd4d2903dbf': {
  //           usd: 2.12,
  //           eth: 0.00171898,
  //         },
  //         '0xf1f955016ecbcd7321c7266bccfb96c68ea5e49b': {
  //           usd: 0.0098903,
  //           eth: 8.02e-6,
  //         },
  //         '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': {
  //           usd: 1219.29,
  //           eth: 0.98878327,
  //         },
  //         '0xa117000000f279d81a1d3cc75430faa017fa5a2e': {
  //           usd: 2.23,
  //           eth: 0.00180583,
  //         },
  //         '0xbc396689893d065f41bc2c6ecbee5e0085233447': {
  //           usd: 0.464503,
  //           eth: 0.00037669,
  //         },
  //       })
  //     );
  //   }
  // ),
  rest.get(
    'https://api.coingecko.com/api/v3/simple/price/',
    (req, res, ctx) => {
      return res(ctx.json({ ethereum: { eth: 1.0, usd: 1233.12 } }));
    }
  ),
  rest.post(
    'https://eth-mainnet.alchemyapi.io/v2/cQGZUiTLRCFsQS7kbRxPJK4eH4fTTu88',
    (req, res, ctx) => {
      return res(ctx.json([{ jsonrpc: '2.0', id: 42, result: '0x1' }]));
    }
  ),
];

const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f';
const amountInDAI = '2';

const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const amountInUSDT = '1';

const fiatValueIn = '3.00';
const fiatValueOut = '3.01';

const bptOut = '4';

describe.skip('InvestPreviewModalV2.vue', () => {
  beforeEach(() => {
    server.use(...handlers);
  });

  it('should show correct token amounts in and out', async () => {
    const queryClient = new QueryClient();
    // new BlocknativeSdk({
    //   dappId: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || '',
    //   networkId: 1,
    //   onerror: error => {
    //     console.log(`[Blocknative] encountered an error`, error);
    //   },
    // });

    queryClient.mount();

    // Make plugin available in options API

    const { html } = render(UserSettingsProvider, {
      slots: {
        default() {
          return h(
            TokenListProvider,
            {},
            {
              default() {
                return h(
                  TokensProvider,
                  {},
                  {
                    default() {
                      return h(
                        AppProvider,
                        {},
                        {
                          default() {
                            return h(
                              JoinPoolProvider,
                              { pool, isSingleAssetJoin: false },
                              {
                                default() {
                                  return h(InvestPreviewModalV2, {
                                    pool,
                                    isSingleAssetJoin: false,
                                    amountsIn: [
                                      {
                                        address: USDT,
                                        value: amountInUSDT,
                                        valid: true,
                                      },
                                      {
                                        address: DAI,
                                        value: amountInDAI,
                                        valid: true,
                                      },
                                    ],
                                    bptOut,
                                    fiatValueIn,
                                    fiatValueOut,
                                    priceImpact: 0.001,
                                    highPriceImpact: false,
                                    rektPriceImpact: false,
                                    missingPricesIn: false,
                                    resetAmounts: jest.fn(),
                                  });
                                },
                              }
                            );
                          },
                        }
                      );
                    },
                  }
                );
              },
            }
          );
        },
      },
      props: {},
      global: {
        components: {},
        plugins: [Web3Plugin, blocknative],
        provide: {
          [VUE_QUERY_CLIENT]: queryClient,
          [JoinPoolProviderSymbol]: useJoinPool,
          // [bnSdkSymbol]: blocknative,
          // [UserSettingsProviderSymbol]: useUserSettings,
        },
      },
    });

    const tokensInWrapper = await screen.findByTestId('tokens-in');
    const tokensOutWrapper = await screen.findByTestId('tokens-out');

    const priceImpact = await screen.findByText('0.10%');

    // Check tokens in values

    // DAI
    const DAIValueInText = await within(tokensInWrapper).findByText('$2.00');
    const DAIWeightInText = await within(tokensInWrapper).findByText(
      /66\.67%/i
    );
    expect(DAIValueInText).toBeVisible();
    expect(DAIWeightInText).toBeVisible();

    // USDT
    const USDTValueInText = await within(tokensInWrapper).findByText('$1.00');
    const USDTWeightInText = await within(tokensInWrapper).findByText(
      /33\.33%/i
    );
    expect(USDTValueInText).toBeVisible();
    expect(USDTWeightInText).toBeVisible();

    // Check tokens out values
    const fiatValueOutText = await within(tokensOutWrapper).findByText(
      `$${fiatValueOut}`
    );
    const tokenOutText = await within(tokensOutWrapper).findByText(
      pool.symbol as string
    );
    const bptOutText = await within(tokensOutWrapper).findByText(bptOut);

    console.log(html());
    expect(bptOutText).toBeVisible();
    expect(tokenOutText).toBeVisible();
    expect(fiatValueOutText).toBeVisible();

    expect(priceImpact).toBeVisible();
  });
});
