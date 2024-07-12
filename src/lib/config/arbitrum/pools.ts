import { CSP_ISSUE_POOL_IDS } from '@/constants/pool-lists/csp-issue';
import { PoolWarning, Pools } from '@/types/pools';
import { Network } from '../types';
import { Protocol } from '@/composables/useProtocols';

const pools: Pools = {
  IdsMap: {},
  Pagination: {
    PerPage: 10,
    PerPool: 10,
    PerPoolInitial: 5,
  },
  BoostsEnabled: true,
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: [],
  },
  BlockList: [''],
  IncludedPoolTypes: [
    'Weighted',
    'Stable',
    'MetaStable',
    'LiquidityBootstrapping',
    'Investment',
    'StablePhantom',
    'ComposableStable',
    'GyroE',
  ],
  Stable: {
    AllowList: [
      '0x9be7de742865d021c0e8fb9d64311b2c040c1ec1000200000000000000000012', // arbitrum
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016', // arbitrum
      '0x386b5d43ba8b97c43d4afb4cdae7877a1b295e8a000000000000000000000020', // tusd arbitrum
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d', // mai
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f', // VST
      '0xd89746affa5483627a87e55713ec1905114394950002000000000000000000bf', // fluid stable
      '0x7bceaa9c5e7f4836fec3bce2d5346637c9b13970000000000000000000000102', // vesta new stable
      '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c000000000000000000000159', // stETH
      '0x36bf227d6bac96e2ab1ebb5492ecec69c691943f000200000000000000000316', // wsteth/weth stable
      '0x077794c30afeccdf5ad2abc0588e8cee7197b71a000000000000000000000352', // bbrfusd
      '0x70ba7dc356b41c849e74c679932c852cc0331a90000000000000000000000357', // gdai/mai/usdc
      '0x519cce718fcd11ac09194cff4517f12d263be067000000000000000000000382', // overnight usd+
      '0xcba9ff45cfb9ce238afde32b0148eb82cbe635620000000000000000000003fd', // bb-a-eth / reth
      '0xee02583596aee94cccb7e8ccd3921d955f17982a00000000000000000000040a', // bb-a-usd aave v3
      '0x5a7f39435fd9c381e4932fa2047c9a5136a5e3e7000000000000000000000400', // wsteth / bb-a-weth
      '0x161cd105034ac000d2aad75f06c26e943130bc0e000200000000000000000426', // nfte/weth
      '0x542f16da0efb162d20bf4358efa095b70a100f9e000000000000000000000436', // tbtc
      '0x567ecfcb22205d279bb8eed3e066989902bf03d5000000000000000000000452', // dola/bb-a-usd
      '0x8bc65eed474d1a00555825c91feab6a8255c2107000000000000000000000453', // dola/usdc
      '0x01990f1e6f7f32296f125ee9469705c1c070054d000000000000000000000461', // reth/WETH
      '0xbe0f30217be1e981add883848d0773a86d2d2cd4000000000000000000000471', // rETH-bb-a-WETH
      '0x45c4d1376943ab28802b995acffc04903eb5223f000000000000000000000470', // wstETH-bb-a-WETH
      '0xc6eee8cb7643ec2f05f46d569e9ec8ef8b41b389000000000000000000000475', // bb-a-USD
      '0x3fd4954a851ead144c2ff72b1f5a38ea5976bd54000000000000000000000480', // ankreth/wsteth
      '0x9cebf13bb702f253abf1579294694a1edad00eaa000000000000000000000486', // bb-a-usdc/bb-a-usdc.e
      '0x4a2f6ae7f3e5d715689530873ec35593dc28951b000000000000000000000481', // reth/cbeth/wseth
      '0xa8af146d79ac0bb981e4e0d8b788ec5711b1d5d000000000000000000000047b', // dai+/usd+
      '0xd6d20527c7b0669989ee082b9d3a1c63af742290000000000000000000000483', // dola/usd+
      '0xbbf9d705b75f408cfcaee91da32966124d2c6f7d00000000000000000000047e', // DOLA/bbaUSD
      '0xa1ea76c42b2938cfa9abea12357881006c52851300000000000000000000048f', // DUSD/bbaUSD
      '0x9791d590788598535278552eecd4b211bfc790cb000000000000000000000498', // wstETH-WETH-BPT
      '0xade4a71bb62bec25154cfc7e6ff49a513b491e81000000000000000000000497', // rETH-WETH-BPT
      '0x423a1323c871abc9d89eb06855bf5347048fc4a5000000000000000000000496', // 4POOL-BPT
      '0x3cdf30e36154a66a4478e15ed41659b5bb0738f100000000000000000000049b', // DUSD-4POOL-BPT
      '0x84a1038d55e887c2abb8cb02ccf4c9d3871c859a000000000000000000000489', // rETH-WETH (stafi)
      '0x0c8972437a38b389ec83d1e666b69b8a4fcf8bfd00000000000000000000049e', // wstETH/rETH/sfrxETH
      '0xee7e36b8b24a1c60c28e7336e937d43f74aad7400000000000000000000004a4', // STAR-USDC.e
      '0xa7952cd7ea8effbd81c2b4de72a1e5b9bd1b3e2a0000000000000000000004a1', // USDF/4pool
      '0x6b9f3f6b9054a45702d3f2c6e3d32a60204934cb0000000000000000000004a7', // USDF/USDC
      '0xead7e0163e3b33bf0065c9325fc8fb9b18cc82130000000000000000000004a9', // STAR/USDC-BPT
      '0x3f09c77b19ad8bb527355ec32d5ce98421fec2e30000000000000000000004b2', // axlBAL/BAL
      '0xe6d48f62a7d87e6bd13c283ca55068f0a73e6a5f0000000000000000000004cc', // USDV/FRAX
      '0xe6fcb0ac7e05196b0870ae2aeb80dc9079ee1a250000000000000000000004cb', // USDV/USDC
      '0xef093ccfdd4d5a590b028463e0528049939889c90000000000000000000004cf', // SWEEP/USDC
      '0x451b0afd69ace11ec0ac339033d54d2543b088a80000000000000000000004d5', // plsRDNT-Stable
      '0x2ce4457acac29da4736ae6f5cd9f583a6b335c270000000000000000000004dc', // sFRAX/4POOL
      '0xdfa752ca3ff49d4b6dbe08e2d5a111f51773d3950000000000000000000004e8', // sFRAX/FRAX
      '0xd0ec47c54ca5e20aaae4616c25c825c7f48d40690000000000000000000004ef', // rETH/wETH BPT
      '0xc2598280bfea1fe18dfcabd21c7165c40c6859d30000000000000000000004f3', // wstETH/sfrxETH
      '0x6fe0e32081460d0e4469e36595e32c0f343a0e9c0000000000000000000004f4', // wstETH/cbETH
      '0x2d6ced12420a9af5a83765a8c48be2afcd1a8feb000000000000000000000500', // cbETH/rETH/wstETH
      '0x99d85550623b249c54ee6e7f42861dcefa3ee8d7000000000000000000000503', // USX/USDC BPT
      '0x4b3af34eb1135d59df8b9cdc2ff07d30d05334c400000000000000000000050d', // weETH/rETH
      '0x7a66b9ef65a88e9abc94a08c9b043e73685d850b000000000000000000000517', // ezETH/wETH
      '0xb61371ab661b1acec81c699854d2f911070c059e000000000000000000000516', // ezETH/wstETH
      '0x94f9ad04b4bd9e70957a429bfec20140c164983600000000000000000000051a', // SWEEP-USDC-BPT
      '0x59743f1812bb85db83e9e4ee061d124aaa64290000000000000000000000052b', // sUSDe/sFRAX
      '0x2f0cdf8596be980ef24924ca7bf54e630ca526b2000000000000000000000529', // sUSDe/USDC
      '0x537d8ef9e6e0adfb099cb14aeaf04ebeffaf444c000000000000000000000528', // USDe/USDC
      '0xfb2f7ed572589940e24c5711c002adc59d5e79ef000000000000000000000535', // jitoSOL/wSOL
      '0x7b54c44fbe6db6d97fd22b8756f89c0af16202cc00000000000000000000053c', // ETHx/wstETH
    ],
  },
  Investment: {
    AllowList: [''],
  },
  Weighted: {
    // Deprecated list, no longer in use
    AllowList: [
      '0xd449efa0a587f2cb6be3ae577bc167a7745258100001000000000000000003f4',
      '0xce34c867d7053befb3421d6adabcb5ce55ff777b00010000000000000000041b', // crv/wbtc/wsteth/gdai/uni/link
      '0xd3d5d45f4edf82ba0dfaf061d230766032a10e07000200000000000000000413', // stg/bb-a-usd
      '0x9fb7d6dcac7b6aa20108bad226c35b85a9e31b63000200000000000000000412', // wsteth-bb-a-weth / bb-a-usd
      '0x3efd3e18504dc213188ed2b694f886a305a6e5ed00020000000000000000041d', // peg/weth
      '0x89dc7e71e362faf88d92288fe2311d25c6a1b5e0000200000000000000000423', // ohm/weth
      '0xce6195089b302633ed60f3f427d1380f6a2bfbc7000200000000000000000424', // ohm/usdc
      '0xc69771058481551261709d8db44977e9afde645000010000000000000000042a', // wbtc/wsteth-bb-a-weth/bb-a-usd
      '0x49f3040f6e4dc7ff8fd85502bc40877311ff13d700020000000000000000042b', // dfx/weth
      '0x161cd105034ac000d2aad75f06c26e943130bc0e000200000000000000000426', // nfte/weth
      '0x542f16da0efb162d20bf4358efa095b70a100f9e000000000000000000000436', // tbtc/wbtc
      '0xc9f52540976385a84bf416903e1ca3983c539e34000200000000000000000434', // tbtc/weth
      '0x8d333f82e0693f53fa48c40d5d4547142e907e1d000200000000000000000437', // pal/ohm
      '0x00e7ccb0e16fc07d0cb528efea2c130c41c2fc1600010000000000000000043d', // 25LDO/25wstETH/25RPL/25rETH
      '0xa231aea07bb5e79ae162f95903806fc5ad65ff1100020000000000000000043f', // dfx/weth
      '0xce2da1d3e5b5e4e1913f9ff65ee029d38682d8b900020000000000000000044e', // acid/weth
      '0xd0dc20e6342db2de82692b8dc842301ff9121805000200000000000000000454', // nfte/wsteth-bb-a-weth
      '0xbcaa6c053cab3dd73a2e898d89a4f84a180ae1ca000100000000000000000458', // bal/arb/aura
      '0xc7fa3a3527435720f0e2a4c1378335324dd4f9b3000200000000000000000459', // auraBAL/wstETH
      '0x93b48e950380adcf6d67c392f20d44fb88d258dc000200000000000000000465', // usdc.e/usdc
      '0x0e1cdc10a131d07636fb4cf322f79b8df551dd9e00020000000000000000046a', // 50BAL-50WETH
      '0xfcc9a8d58e41cbf582cff798148750637eadb1ff00020000000000000000046c', // 50RDNT-50USDC.e
      '0x00fcd3d55085e998e291a0005cedecf58ac14c4000020000000000000000047f', // 50STG-50bbaUSD
      '0x76b9cbd55fd6776c2de18738a04b0f9da56ce6ca00020000000000000000048d', // 80BETS/20wstETH
      '0xa35cb2539e6885df99afc123c98f6b492c8675a8000200000000000000000490', // 50wstETH-50ARB
      '0x3d87b6a7d3d4411a69949671e0c4806d671b34a6000200000000000000000491', // 50wstETH-50ankrETH
      '0x1f181696e86882c317f5a6cf433666476a75ae65000200000000000000000492', // 50RDNT-50USDT
      '0x760975d3d8b02c202c8ee9d6fa6c904cecfa3b6e000200000000000000000460', // 55AURA-45wstETH
      '0xcf8b555b7754556cf2ac2165e77ee23ed8517d7900020000000000000000045e', // 50AURA-50bb-a-USD
      '0x11c70d4e54b811548e2cac4267611db43b5b175a00010000000000000000049d', // 25USDC-50STAR-25USDC.e
      '0x7ff77d8b0fb6d5939203f5259c406e75eb6690250001000000000000000004a5', // 33DPX-33VSTA-33LINK
      '0xaa4fc9523502709a85b89684b1138c1328eaa4340002000000000000000004af', // 50STG-50ARB
      '0xdf4a17132bbad1c1e313c7877171af9ad0b5c8040002000000000000000004b1', // 50CRV-50wstETH
      '0xedd952135a5893e9bf61fe0a93def0e56d56c12d0002000000000000000004b3', // 50WETH/50-4Pool
      '0xa1a8bf131571a2139feb79401aa4a2e9482df6270002000000000000000004b4', // 50wstETH/50-4Pool
      '0x6dee17e9e419de0a05d1cc9f015ba91072f845440002000000000000000004b5', // 80OVN/20wUSD+
      '0x85ec6ae01624ae0d2a04d0ffaad3a25884c7d0f30002000000000000000004b6', // 80OVN/20wUSD+
      '0x52b520c7cabf47ffd8c328e597a560493f6bd3740002000000000000000004b8', // 50ARB-50USDC
      '0xb6911f80b1122f41c19b299a69dca07100452bf90002000000000000000004ba', // ECLP-USDC-USDT
      '0x848a7ff84cf73d2534c3dac6ab381e177a1cff240001000000000000000004bb', // 33108-33WETH-33USDC
      '0x18339d7ec4599c84067e81c20b012e83c385ba9c0002000000000000000004bd', // 50GOLD-5050wstETH/50-4Pool
      '0x2e8ea681fd59c9dc5f32b29de31f782724ef4dcb0001000000000000000004bc', // 50GOLD-25USDC-25WSTETH
      '0x49b2de7d214070893c038299a57bac5acb8b8a340001000000000000000004be', // GOLD-BAL-AURA-wstETH
      '0x835772bab114563746da80806930a9e37aa853440002000000000000000004c0', // D2D-rETH
      '0x88e2c969e2a1c69c16d1dcd9f8acde4c6ab3838a0002000000000000000004c1', // 80FOX-20WETH
      '0xec0448648fb7df7f9345f05ed6fde054a19e24780002000000000000000004c2', // 50wstETH-50USDC
      '0x79b79bb722de0a3bd4b5261037d5a5026fe59d270002000000000000000004c3', // 10WETH-90noiseGPT
      '0x051ddfbd30bea7326646bd027a8a7ac0c3626f3c0002000000000000000004c4', // 50wstETH-50WETH
      '0x7435e7250238e65d8ccb1b6398f402f7cb550d480002000000000000000004c7', // 80WBTC-20USDC
      '0x8f97c6ddf16f75eefca0faf44864fc1f8fc9a1310002000000000000000004c8', // 50WBTC-50LINK
      '0xd1882ca6a22f3df54cd675b300b815864de67b200001000000000000000004c9', // Savvy TriCrypto Pool
      '0x32b1d14c6c31dff0407058586a01614da686dfcc0001000000000000000004ce', // 10BAL-20CRV-20SUSHI-25UNI-25GMX
      '0xb52bd7459cb4754ec30e5b0691574159fb0812170002000000000000000004cd', // 50USDC-50USDT
      '0x965353ce4d898e5367d0cdfefb5df1f0dca726690001000000000000000004ca', // 67BAL-29WBTC-4wstETH
      '0x0755c402ef855046a43459827771147c964a798f0002000000000000000004d2', // 50wstETH-50USDC
      '0x21841e071de6da9cc0c2927ffbd91469b390add10001000000000000000004d1', // 40WBTC-40WETH-204POOL-BPT
      '0x9d8dc132625a131dc80ccf49ed9e9998f041a5870001000000000000000004d0', // 25BAL-25AURA-25wstETH-25ARB
      '0x4aba825337f83c2c1d50384f545095b9519da3a50002000000000000000004d3', // 50USDC-50USDC.e
      '0x9f8ed1acfe0c863381b9081aff2144fc867aa7730002000000000000000004d4', // 50ANKR/50ankrETH
      '0x04d701603388b280e7761b766c9494b6907a5e400002000000000000000004d8', // 50wstETH-50ARB
      '0x2f113ec227fb9c46594a62c755c6dfa6b111e3e70002000000000000000004d7', // 50wstETH-50FOREX
      '0xb01df7b9337c9264b2e60afc08946975b8fd010f0002000000000000000004db', // 50BAL-50ARB
      '0xec727cfc37277260677875620c35eb176b7df4bf0002000000000000000004dd', // 50wstETH/50sDAI
      '0xc757f12694f550d0985ad6e1019c4db4a803f1600002000000000000000004de', // 50wstETH/50sFRAX
      '0x0ce6bb7108406ec73e5af03047cb859de56702490002000000000000000004df', // 50FRACTION-50WETH
      '0x39a5bfd5fe32026cd93d81859b4b38cea78d82200002000000000000000004e0', // 80LUMIN-20rETH
      '0x2a352b69b8187b77f6ad2718a49138bb80251dd90002000000000000000004e1', // 50AURA-50WETH
      '0xad12b8be32506fc4998b09c09fb3865b9cd518320002000000000000000004e2', // 50USDT-50USDC.e
      '0xe25ecadca47419e9aee2700ceab4e7c4b01b94ca0002000000000000000004e4', // 20WETH-80PAL
      '0x9bfcd4189cf9062697746ce292350f42fdee457c0002000000000000000004d6', // 50DFX-50WETH
      '0x227f73dc8dd716aa212b9e38caa337d0685eaf2d0002000000000000000004e6', // 50ARB-50USDT
      '0x8ac69675a1fccdcd742091065550b30e4490835a0002000000000000000004e7', // 50plsRDNT-50WETH
      '0xfe03621e739bdcd2ee9db70b66eff781e470d7f60002000000000000000004ea', // 50BAL-50ARB
      '0xa35229bc4c149a25a73b9338f946ca5c7796fca70002000000000000000004e9', // 50USDT-50USDC.e
      '0xcaa38acb9fb69dd93ce90b348334cc5507208d7a0001000000000000000004ec', // 45WBTC-104POOL-BPT-45WETH
      '0xef26de43ebea4635d9ebae1c827982b5e67596550002000000000000000004ed', // 50ARB-50USDT
      '0x9dce1f90a51ab38471ad9722e504419354a745a50002000000000000000004ee', // 50ARB-50USDC
      '0x05f0a172608853d5431c69888a0a559886a3319f0002000000000000000004f0', // ARSWETH
      '0x3e5fb03652f40b6c5a30d0c0ec38cc065332dc4d0002000000000000000004f2', // 50BAL-50ARB
      '0xeb3e64ad9314d20bf943ac72fb69f272603f9cce0002000000000000000004f5', // 80SYNO-20WETH
      '0x60b3831cc85f4166f1dc3390be944a0818197bf20002000000000000000004fa', // 50BAL-50USDC.e
      '0xaf8912a3c4f55a8584b67df30ee0ddf0e60e01f80002000000000000000004fc', // 50OLAS-50WETH
      '0x9fe9ee7c16d7569f31385611ef2f6d08a470fdab0002000000000000000004fe', // 50WBTC-50ARB
      '0xbeb9ff5846e677366efef81761f2b9ecc0ff2703000200000000000000000501', // 50USDC-50sFRAX
      '0xf8201d478418d6a67507e10880eafaaacd3230da000200000000000000000504', // ECLP-sFRAX-FRAX
      '0xd558d4ed9fb22d4a76210a62afc6af86e5736dcf000200000000000000000505', // 50USX-50ARB
      '0x5d5822a2648333fbee05f8d539ef9e5107b81d9b000200000000000000000506', // 50GMX-50USDT
      '0xebd7cbf210b21469227a828129c2816c9917f3e9000200000000000000000507', // 99DEFI5-1USDC.e
      '0x1ab34f24b5b8f6984f521a20afba7c38dd8de5fe000100000000000000000509', // 50BANANIA-20WETH-10agEUR-10rETH-5BTC.b-5USDT
      '0xa158da5f4e412a5c97503527ef5aa2de26c62bf100020000000000000000050a', // 50WBTC-50GMX
      '0xc6295e969be65560d1cb8ce06b1b20e62337625c00020000000000000000050f', // PUPPET-WETH
      '0xebbdd03f9831972ee0ec2bdd2dd07824df06344c000100000000000000000510', // dUSD
      '0x6e384c23253e2459b3d0f6c19f5532515643b12000020000000000000000050b', // LP-EURS-USDC
      '0x065134d14914f6bd422026e532309df756c8d2ca000200000000000000000511', // 504POOL-BPT-50MAGIC
      '0x29cc3af7ed299866a4ee3ecbde4b48bd1eccff9c000200000000000000000512', // 80xFORTUN-20FORTUN
      '0xdf55e00b872563d8799b371033704b5a9407d30b000200000000000000000513', // 20WETH-80FORTUN
      '0xfc90fa1ea12d48748f417c269e8dbc2f3715755e000200000000000000000515', // 50WETH-50ARB
      '0x920ce9ec4c52e740ab4c3d36fb5454c274907ae500020000000000000000051b', // 80PRF-20WETH
      '0x214980d2cb5e4322e3d02570aadfc975e0d09499000200000000000000000520', // 50USDC-50USDT
      '0xb2c1fa809b0d86890ee9198e8d5f3d2e6b3f4e9c000200000000000000000521', // 45ezETH-55WBTC
      '0x97ae0a49eed95fb66684579d110fcc76d55b6c1c000200000000000000000522', // MER/USD
      '0xa6c8ff647d6239a4bdfed023185f9c42c7db3252000200000000000000000523', // 994POOL-BPT-1MER
      '0xa83b8d30f61d7554ad425d8067d8ba6eaeb6b042000200000000000000000525', // 70WETH-30ARB
      '0x64abeae398961c10cbb50ef359f1db41fc3129ff000200000000000000000526', // 80AURA-20WETH
      '0xb09dc8f98164974fa89e55a97fd99b62bdbe4de200020000000000000000052c', // 50T/50wETH
      '0xe26a52ca1f508ff026f366ab6505bb95332a51d600020000000000000000052d', // 50WETH-50USDC
      '0x026a586b3fe3b3d07375b4a11a505c8b4ef07eec000200000000000000000533', // 50weETH-50WETH
      '0x3b106b7ae88c3f8869b5221d2bbae398afc26737000100000000000000000534', // 33WETH-33USDC-33USDT
      '0x260dbd54d87a10a0fc9d08622ebc969a3bf4e6bb000200000000000000000536', // jitoSOL/wstETH
      '0xf2658f994c882237d3612099cae541d50348fcf9000200000000000000000537', // PUPPET-WETH
      '0xbc450dcb3a135a57448f8054badaec5c9f2af571000200000000000000000538', // 50SOL-50wstETH
      '0x19da41a2ccd0792b9b674777e72447903fe29074000200000000000000000539', // PUPPET-WETH
    ],
  },
  Factories: {
    '0x7dfdef5f355096603419239ce743bfaf1120312b': 'weightedPool', // Arbitrum Weighted
    '0xcf0a32bbef8f064969f21f7e02328fb577382018': 'weightedPool', // Arbitrum WeightedOracle
    '0x2433477a10fc5d31b9513c638f19ee85caed53fd': 'stablePool', // Arbitrum Stable
    '0xebfd5681977e38af65a7487dc70b8221d089ccad': 'stablePool', // Arbitrum MetaStable
    '0x142b9666a0a3a30477b052962dda81547e7029ab': 'liquidityBootstrappingPool', // Arbitrum LBP (old)
    '0x1802953277fd955f9a254b80aa0582f193cf1d77': 'liquidityBootstrappingPool', // Arbitrum LBP (new)
    '0xacd615b3705b9c880e4e7293f1030b34e57b4c1c': 'managedPool', // arbitrum managed
    '0xdae7e32adc5d490a43ccba1f0c736033f2b4efca': 'boostedPool', // arbitrum stablephantom
    '0xef44d6786b2b4d544b7850fe67ce6381626bf2d6': 'stablePool', // stable pool v2
    '0xaeb406b0e430bf5ea2dc0b9fe62e4e53f74b3a33': 'composableStablePool', // ComposableStable
    '0x8df6efec5547e31b0eb7d1291b511ff8a2bf987c': 'weightedPool', // weighted pool v2
    '0x1c99324edc771c82a0dccb780cc7dda0045e50e7': 'composableStablePool', // ComposableStable V3
    '0xf1665e19bc105be4edd3739f88315cc699cc5b65': 'weightedPool', // Weighted Pool V3
    '0xc7e5ed1054a24ef31d827e6f86caa58b3bc168d7': 'weightedPool', // weighted pool v4
    '0x2498a2b0d6462d2260eac50ae1c3e03f4829ba95': 'composableStablePool', // ComposableStable V4
    '0xa8920455934da4d853faac1f94fe7bef72943ef1': 'composableStablePool', // ComposableStable V5
    '0x4bdcc2fb18aeb9e2d281b0278d946445070eada7': 'composableStablePool', // ComposableStable V6
    '0xdca5f1f0d7994a32bc511e7dba0259946653eaf6': 'gyroE', // Gyro ECLP
    '0x7a36527a02d96693b0af2b70421f952816a4a088': 'gyroE', // Gyro ECLP
  },
  Stakable: {
    VotingGaugePools: [
      '0x64541216bafffeec8ea535bb71fbc927831d0595000100000000000000000002',
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d',
      '0x0adeb25cb5920d4f7447af4a0428072edc2cee2200020000000000000000004a',
      '0x1533a3278f3f9141d5f820a184ea4b017fce2382000000000000000000000016',
      '0x1779900c7707885720d39aa741f4086886307e9e00020000000000000000004b',
      '0x4a3a22a3e7fee0ffbb66f1c28bfac50f75546fc7000200000000000000000008',
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f',
      '0x651e00ffd5ecfa7f3d4f33d62ede0a97cf62ede2000200000000000000000006',
      '0xb28670b3e7ad27bd41fb5938136bf9e9cba90d6500020000000000000000001e',
      '0xb340b6b1a34019853cb05b2de6ee8ffd0b89a008000100000000000000000036',
      '0xb5b77f1ad2b520df01612399258e7787af63025d000200000000000000000010',
      '0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac000200000000000000000017',
      '0xc61ff48f94d801c1ceface0289085197b5ec44f000020000000000000000004d',
      '0xcc65a812ce382ab909a11e434dbf75b34f1cc59d000200000000000000000001',
      '0xe1b40094f1446722c424c598ac412d590e0b3ffb000200000000000000000076',
      '0xb3028ca124b80cfe6e9ca57b70ef2f0ccc41ebd40002000000000000000000ba',
      '0x7bceaa9c5e7f4836fec3bce2d5346637c9b13970000000000000000000000102',
      '0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c000000000000000000000159',
      '0x178e029173417b1f9c8bc16dcec6f697bc323746000200000000000000000158',
      '0x13f2f70a951fb99d48ede6e25b0bdf06914db33f00020000000000000000016b',
      '0xf93579002dbe8046c43fefe86ec78b1112247bb800020000000000000000021d',
      '0x36bf227d6bac96e2ab1ebb5492ecec69c691943f000200000000000000000316',
      '0x077794c30afeccdf5ad2abc0588e8cee7197b71a000000000000000000000352',
      '0x519cce718fcd11ac09194cff4517f12d263be067000000000000000000000382',
      '0x32df62dc3aed2cd6224193052ce665dc181658410002000000000000000003bd',
      '0xcba9ff45cfb9ce238afde32b0148eb82cbe635620000000000000000000003fd',
      '0xee02583596aee94cccb7e8ccd3921d955f17982a00000000000000000000040a',
      '0x5a7f39435fd9c381e4932fa2047c9a5136a5e3e7000000000000000000000400',
      '0xd3d5d45f4edf82ba0dfaf061d230766032a10e07000200000000000000000413',
      '0x9fb7d6dcac7b6aa20108bad226c35b85a9e31b63000200000000000000000412',
      '0x4fd63966879300cafafbb35d157dc5229278ed2300020000000000000000002b',
      '0x542f16da0efb162d20bf4358efa095b70a100f9e000000000000000000000436',
      '0xc9f52540976385a84bf416903e1ca3983c539e34000200000000000000000434',
      '0xa231aea07bb5e79ae162f95903806fc5ad65ff1100020000000000000000043f',
      '0x8d333f82e0693f53fa48c40d5d4547142e907e1d000200000000000000000437',
      '0xce2da1d3e5b5e4e1913f9ff65ee029d38682d8b900020000000000000000044e',
      '0x8bc65eed474d1a00555825c91feab6a8255c2107000000000000000000000453',
      '0x567ecfcb22205d279bb8eed3e066989902bf03d5000000000000000000000452',
      '0xc7fa3a3527435720f0e2a4c1378335324dd4f9b3000200000000000000000459',
      '0x01990f1e6f7f32296f125ee9469705c1c070054d000000000000000000000461',
      '0x26e5c5e2b48815b59640a1a82ac3c2249188daf4000000000000000000000476',
      '0xfa92d9dd808d0e8d68079bdc7f01e74658e1ef15000000000000000000000477',
      '0xbe0f30217be1e981add883848d0773a86d2d2cd4000000000000000000000471',
      '0x45c4d1376943ab28802b995acffc04903eb5223f000000000000000000000470',
      '0xc6eee8cb7643ec2f05f46d569e9ec8ef8b41b389000000000000000000000475',
      '0x00fcd3d55085e998e291a0005cedecf58ac14c4000020000000000000000047f',
      '0xbbf9d705b75f408cfcaee91da32966124d2c6f7d00000000000000000000047e',
      '0x3fd4954a851ead144c2ff72b1f5a38ea5976bd54000000000000000000000480',
      '0xa8af146d79ac0bb981e4e0d8b788ec5711b1d5d000000000000000000000047b',
      '0xd6d20527c7b0669989ee082b9d3a1c63af742290000000000000000000000483',
      '0x4a2f6ae7f3e5d715689530873ec35593dc28951b000000000000000000000481',
      '0x9cebf13bb702f253abf1579294694a1edad00eaa000000000000000000000486',
      '0x84a1038d55e887c2abb8cb02ccf4c9d3871c859a000000000000000000000489',
      '0xa1ea76c42b2938cfa9abea12357881006c52851300000000000000000000048f',
      '0x76b9cbd55fd6776c2de18738a04b0f9da56ce6ca00020000000000000000048d',
      '0x423a1323c871abc9d89eb06855bf5347048fc4a5000000000000000000000496',
      '0xade4a71bb62bec25154cfc7e6ff49a513b491e81000000000000000000000497',
      '0x9791d590788598535278552eecd4b211bfc790cb000000000000000000000498',
      '0x3cdf30e36154a66a4478e15ed41659b5bb0738f100000000000000000000049b',
      '0x0c8972437a38b389ec83d1e666b69b8a4fcf8bfd00000000000000000000049e',
      '0xead7e0163e3b33bf0065c9325fc8fb9b18cc82130000000000000000000004a9',
      '0x6b9f3f6b9054a45702d3f2c6e3d32a60204934cb0000000000000000000004a7',
      '0x85ec6ae01624ae0d2a04d0ffaad3a25884c7d0f30002000000000000000004b6',
      '0x004700ba0a4f5f22e1e78a277fca55e36f47e09c000000000000000000000104',
      '0x835772bab114563746da80806930a9e37aa853440002000000000000000004c0',
      '0x49b2de7d214070893c038299a57bac5acb8b8a340001000000000000000004be',
      '0x2e8ea681fd59c9dc5f32b29de31f782724ef4dcb0001000000000000000004bc',
      '0xd1882ca6a22f3df54cd675b300b815864de67b200001000000000000000004c9',
      '0x9bfcd4189cf9062697746ce292350f42fdee457c0002000000000000000004d6', // 50DFX-50WETH
      '0xe25ecadca47419e9aee2700ceab4e7c4b01b94ca0002000000000000000004e4',
      '0xdfa752ca3ff49d4b6dbe08e2d5a111f51773d3950000000000000000000004e8',
      '0xd0ec47c54ca5e20aaae4616c25c825c7f48d40690000000000000000000004ef',
      '0xc2598280bfea1fe18dfcabd21c7165c40c6859d30000000000000000000004f3',
      '0x2d6ced12420a9af5a83765a8c48be2afcd1a8feb000000000000000000000500',
      '0x4b3af34eb1135d59df8b9cdc2ff07d30d05334c400000000000000000000050d',
      '0xb61371ab661b1acec81c699854d2f911070c059e000000000000000000000516',
      '0xeb3e64ad9314d20bf943ac72fb69f272603f9cce0002000000000000000004f5',
      '0x125bc5a031b2db6733bfa35d914ffa428095978b000200000000000000000514',
      '0xca8ecd05a289b1fbc2e0eaec07360c4bfec07b6100020000000000000000051d',
      '0x14abd18d1fa335e9f630a658a2799b33208763fa00020000000000000000051f',
      '0x260dbd54d87a10a0fc9d08622ebc969a3bf4e6bb000200000000000000000536',
      '0xfb2f7ed572589940e24c5711c002adc59d5e79ef000000000000000000000535',
      '0x7b54c44fbe6db6d97fd22b8756f89c0af16202cc00000000000000000000053c',
      '0x395aad0582cd035c6c75ae32043bb83423ddd6f800020000000000000000054c',
      '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c',
      '0xcdcef9765d369954a4a936064535710f7235110a000200000000000000000558',
      '0xd2b6e489ce64691cb46967df6963a49f92764ba9000200000000000000000545',
      '0xfed111077e0905ef2b2fbf3060cfa9a34bab4383000200000000000000000544',
      '0x2b783cd37774bb77d387d35683e8388937712f0a00020000000000000000056b',
      '0x46472cba35e6800012aa9fcc7939ff07478c473e00020000000000000000056c',
      '0xbc88fa2aeb274326ae3f2c66139d5eb33d1f5c2e00020000000000000000056d',
      '0xf890360473c12d8015da8dbf7af11da87337a065000000000000000000000570',
      '0xe8a6026365254f779b6927f00f8724ea1b8ae5e0000000000000000000000580',
      '0xb8cb384e65096386c1edaaf784e842c957fa3645000000000000000000000571',
      '0x5b89dc91e5a4dc6d4ab0d970af6a7f981971a443000000000000000000000572',
      '0x7967fa58b9501600d96bd843173b9334983ee6e600020000000000000000056e',
      '0x7272163a931dac5bbe1cb5fefaf959bb65f7346f000200000000000000000549',
      '0x6e822c64c00393b2078f2a5bb75c575ab505b55c000200000000000000000548',
    ],
    AllowList: [
      '0x88e2c969e2a1c69c16d1dcd9f8acde4c6ab3838a0002000000000000000004c1',
      '0xa1a8bf131571a2139feb79401aa4a2e9482df6270002000000000000000004b4',
      '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635',
      '0x451b0afd69ace11ec0ac339033d54d2543b088a80000000000000000000004d5', // plsRDNT-Stable
      '0xc757f12694f550d0985ad6e1019c4db4a803f1600002000000000000000004de',
      '0x2ce4457acac29da4736ae6f5cd9f583a6b335c270000000000000000000004dc',
      '0x920ce9ec4c52e740ab4c3d36fb5454c274907ae500020000000000000000051b',
      '0x49a16fa51bbcdd3cfeda623e83e50b2f75fbcb4f000200000000000000000566',
      '0x42f7cfc38dd1583ffda2e4f047f4f6fa06cefc7c000000000000000000000553', // osETH/wETH ECLP
      '0x46472cba35e6800012aa9fcc7939ff07478c473e00020000000000000000056c', // gho gyro
    ],
  },
  Metadata: {
    '0xb61371ab661b1acec81c699854d2f911070c059e000000000000000000000516': {
      points: [
        {
          protocol: Protocol.Renzo,
          multiple: '3',
          description:
            'LPs in this pool earn 3x ezPoints on the TVL of the pool (wstETH + ezETH)',
        },
        {
          protocol: Protocol.Eigenlayer,
          multiple: '1',
          description:
            'LPs in this pool get their share of 1x on the amount of ezETH held in the pool.',
        },
      ],
    },
    '0x7272163a931dac5bbe1cb5fefaf959bb65f7346f000200000000000000000549': {
      points: [
        {
          protocol: Protocol.Gyro,
          multiple: '5',
          description:
            'LPs in this pool earn Gyroscope SPIN on the TVL of the pool.',
        },
      ],
    },
    '0x6e822c64c00393b2078f2a5bb75c575ab505b55c000200000000000000000548': {
      points: [
        {
          protocol: Protocol.Gyro,
          multiple: '5',
          description:
            'LPs in this pool earn Gyroscope SPIN on the TVL of the pool.',
        },
      ],
    },
    '0xef0c116a2818a5b1a5d836a291856a321f43c2fb00020000000000000000053a': {
      points: [
        {
          protocol: Protocol.Gyro,
          multiple: '1',
          description:
            'LPs in this pool earn Gyroscope SPIN on the TVL of the pool.',
        },
      ],
    },
    '0x395aad0582cd035c6c75ae32043bb83423ddd6f800020000000000000000054c': {
      points: [
        {
          protocol: Protocol.Gyro,
          multiple: '5',
          description:
            'LPs in this pool earn 5x SPIN on the GYD portion (equivalently 1x on pool TVL) of the pool',
        },
      ],
    },
    '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c': {
      points: [
        {
          protocol: Protocol.Kelp,
          multiple: '2',
          description:
            'LPs earn 2x miles. The Miles boost increases rewards based on the total pool capital, not just rsETH. Your daily Kelp Miles value is calculated by multiplying the effective rsETH balance by 10,000 times the boost value. Your Miles are then distributed based on your share of the liquidity pool.',
        },
        {
          protocol: Protocol.Eigenlayer,
          multiple: '1',
          description:
            'LPs in this pool get their share of Eigenlayer points depending on assets deposited in the pool.',
        },
      ],
    },
  },
  Deep: [
    '0x077794c30afeccdf5ad2abc0588e8cee7197b71a000000000000000000000352', // bb-rf-usd (arbitrum)
    '0x519cce718fcd11ac09194cff4517f12d263be067000000000000000000000382', // overnight usd+
    '0xcba9ff45cfb9ce238afde32b0148eb82cbe635620000000000000000000003fd', // bb-a-eth / reth
    '0xee02583596aee94cccb7e8ccd3921d955f17982a00000000000000000000040a', // bb-a-usd aave v3
    '0x5a7f39435fd9c381e4932fa2047c9a5136a5e3e7000000000000000000000400', // wsteth / bb-a-weth
    '0xd3d5d45f4edf82ba0dfaf061d230766032a10e07000200000000000000000413', // stg/ bb-a-usd
    '0x9fb7d6dcac7b6aa20108bad226c35b85a9e31b63000200000000000000000412', // wsteth-bb-a-weth / bb-a-usd
    '0x567ecfcb22205d279bb8eed3e066989902bf03d5000000000000000000000452', // dola/bb-a-usd
    '0xd0dc20e6342db2de82692b8dc842301ff9121805000200000000000000000454', // nfte/wsteth-bb-a-weth
    '0xbe0f30217be1e981add883848d0773a86d2d2cd4000000000000000000000471', // rETH-bb-a-WETH
    '0x45c4d1376943ab28802b995acffc04903eb5223f000000000000000000000470', // wstETH-bb-a-WETH
    '0xc6eee8cb7643ec2f05f46d569e9ec8ef8b41b389000000000000000000000475', // bb-a-USD
    '0xa8af146d79ac0bb981e4e0d8b788ec5711b1d5d000000000000000000000047b', // dai+/usd+
    '0xd6d20527c7b0669989ee082b9d3a1c63af742290000000000000000000000483', // dola/usd+
    '0x9cebf13bb702f253abf1579294694a1edad00eaa000000000000000000000486', // bb-a-usdc/bb-a-usdc.e
    '0xbbf9d705b75f408cfcaee91da32966124d2c6f7d00000000000000000000047e', // DOLA/bbaUSD
    '0x00fcd3d55085e998e291a0005cedecf58ac14c4000020000000000000000047f', // 50STG-50bbaUSD
    '0xa1ea76c42b2938cfa9abea12357881006c52851300000000000000000000048f', // DUSD/bbausd
    '0x3cdf30e36154a66a4478e15ed41659b5bb0738f100000000000000000000049b', // DUSD-4POOL-BPT
    '0xa1a8bf131571a2139feb79401aa4a2e9482df6270002000000000000000004b4',
    '0x2ce4457acac29da4736ae6f5cd9f583a6b335c270000000000000000000004dc',
  ],
  Deprecated: {
    '0x567ecfcb22205d279bb8eed3e066989902bf03d5000000000000000000000452': {
      newPool:
        '0xbbf9d705b75f408cfcaee91da32966124d2c6f7d00000000000000000000047e',
      description: 'deprecatedPool.hasNewPool.description',
    },
    '0xc6eee8cb7643ec2f05f46d569e9ec8ef8b41b389000000000000000000000475': {
      newPool:
        '0x423a1323c871abc9d89eb06855bf5347048fc4a5000000000000000000000496',
      description: 'deprecatedPool.hasNewPool.description',
    },
    '0xbe0f30217be1e981add883848d0773a86d2d2cd4000000000000000000000471': {
      newPool:
        '0xade4a71bb62bec25154cfc7e6ff49a513b491e81000000000000000000000497',
      description: 'deprecatedPool.hasNewPool.description',
    },
    '0x45c4d1376943ab28802b995acffc04903eb5223f000000000000000000000470': {
      newPool:
        '0x9791d590788598535278552eecd4b211bfc790cb000000000000000000000498',
      description: 'deprecatedPool.hasNewPool.description',
    },
    '0xa1ea76c42b2938cfa9abea12357881006c52851300000000000000000000048f': {
      newPool:
        '0x3cdf30e36154a66a4478e15ed41659b5bb0738f100000000000000000000049b',
      description: 'deprecatedPool.hasNewPool.description',
    },
  },
  NewVersionAvailable: {
    '0xade4a71bb62bec25154cfc7e6ff49a513b491e81000000000000000000000497': {
      newPool:
        '0xd0ec47c54ca5e20aaae4616c25c825c7f48d40690000000000000000000004ef',
      description: 'newVersion.BalIncentives',
      title: 'announcement',
    },
    '0x4a2f6ae7f3e5d715689530873ec35593dc28951b000000000000000000000481': {
      newPool:
        '0x2d6ced12420a9af5a83765a8c48be2afcd1a8feb000000000000000000000500',
      description: 'newVersion.BalIncentives',
      title: 'announcement',
    },
    '0x0c8972437a38b389ec83d1e666b69b8a4fcf8bfd00000000000000000000049e': {
      newPool:
        '0xc2598280bfea1fe18dfcabd21c7165c40c6859d30000000000000000000004f3',
      description: 'newVersion.BalIncentives',
      title: 'announcement',
    },
  },
  GaugeMigration: {},
  BoostedApr: [],
  DisabledJoins: [
    ...CSP_ISSUE_POOL_IDS[Network.ARBITRUM],
    '0xa8af146d79ac0bb981e4e0d8b788ec5711b1d5d000000000000000000000047b',
  ],
  Issues: {
    [PoolWarning.PoolOwnerVulnWarningGovernance]: [
      '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f',
    ],
    [PoolWarning.PoolOwnerVulnWarningEcosystem]: [
      '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d',
    ],
    [PoolWarning.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[Network.ARBITRUM],
    [PoolWarning.RateProviderWarning]: [
      '0xade4a71bb62bec25154cfc7e6ff49a513b491e81000000000000000000000497',
      '0x4a2f6ae7f3e5d715689530873ec35593dc28951b000000000000000000000481',
      '0x0c8972437a38b389ec83d1e666b69b8a4fcf8bfd00000000000000000000049e',
    ],
  },
  BrandedRedirect: {
    FX: 'xave',
    Gyro2: 'gyro',
    Gyro3: 'gyro',
    GyroE: 'gyro',
  },
};

export default pools;
