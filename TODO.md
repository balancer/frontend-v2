./.github/workflows/todo.yml:name: Compile - [ ] Comments
./.github/workflows/todo.yml:    - name: Extract - [ ] comments
./.github/workflows/todo.yml:        # Extract all - [ ] comments into a file
./.github/workflows/todo.yml:        grep -r -E --exclude=- [ ].md,todo.yml 'TODO' . | sed 's/TODO/- [ ]/' > TODO.md
./.github/workflows/todo.yml:    - name: Commit - [ ] file
./.github/workflows/todo.yml:        add: '- [ ].md'
./.github/workflows/todo.yml:        message: 'Add - [ ].md file [skip ci]'
./src/pages/pool/invest.vue:// - [ ]: Don't refetch whole pool, only update balances and weights with
./src/pages/pool/withdraw.vue:// - [ ]: Don't refetch whole pool, only update balances and weights with
./src/dependencies/balancer-sdk.mocks.ts:// - [ ]: move to sor mocks to subfile
./src/dependencies/balancer-sdk.mocks.ts://- [ ]: Improve builder to avoid DeepPartial
./src/dependencies/balancer-sdk.mocks.ts://- [ ]: why mock is not working
./src/dependencies/Multicaller.mocks.ts:  // - [ ]: discover how we can discover different calls and responses
./src/components/cards/SwapCard/SwapRoute.vue:// - [ ]: Fix types
./src/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath.ts: * - [ ]:
./src/services/lido/lido.service.ts:      .times(1 - protocolFeePercentage) // - [ ]: check pool type and use protocol yield percentage cache when applicable
./src/services/staking/staking-rewards.service.ts:        // - [ ] BETTER INTEGRATION OF REWARD TOKEN APRS
./src/services/pool/exchange/serializers/ExitParams.ts:      // - [ ]: do this more elegantly
./src/services/web3/connectors/trustwallet/walletconnect.connector.ts:      // - [ ] type this
./src/services/web3/connectors/gnosis/gnosis.connector.ts:      // - [ ] type this
./src/services/web3/connectors/metamask/metamask.connector.ts:      // - [ ] type this
./src/services/web3/connectors/walletlink/walletlink.connector.ts:      // - [ ] type this
./src/services/web3/connectors/tally/tally.connector.ts:      // - [ ] type this
./src/services/balancer/contracts/balancer-contracts.service.ts:    // - [ ]: Fix affected tests by refactoring export balancerContractsService
./src/services/balancer/pools/exits/handlers/exact-in-exit.handler.ts:        ? // - [ ]: Fix this in the SDK, then remove this toLowerCase
./src/composables/useBlocknative.ts:  // - [ ]: blocknative is going to be deprecated for transaction tracking.
./src/composables/swap/useSwapping.spec.ts://- [ ]: FIX THIS
./src/composables/useTransactions.ts:// - [ ]: What happens if the structure changes? Either keep a version or schema validator.
name: Compile - [ ] Comments (./.github/workflows/todo.yml)
 - name: Extract - [ ] comments (./.github/workflows/todo.yml)
 # Extract all - [ ] comments into a file (./.github/workflows/todo.yml)
 grep -r -E --exclude={- [ ].md,/.github/workflows/todo.yml} 'TODO' . | while read line; do (./.github/workflows/todo.yml)
 todo="$(echo $line | cut -d ':' -f 2- | sed 's/- [ ]/- [ ]/')" (./.github/workflows/todo.yml)
 echo "$todo ($location)" >> - [ ].md (./.github/workflows/todo.yml)
 - name: Commit - [ ] file (./.github/workflows/todo.yml)
 add: '- [ ].md' (./.github/workflows/todo.yml)
 message: 'Add - [ ].md file [skip ci]' (./.github/workflows/todo.yml)
// - [ ]: Don't refetch whole pool, only update balances and weights with (./src/pages/pool/invest.vue)
// - [ ]: Don't refetch whole pool, only update balances and weights with (./src/pages/pool/withdraw.vue)
// - [ ]: move to sor mocks to subfile (./src/dependencies/balancer-sdk.mocks.ts)
//- [ ]: Improve builder to avoid DeepPartial (./src/dependencies/balancer-sdk.mocks.ts)
//- [ ]: why mock is not working (./src/dependencies/balancer-sdk.mocks.ts)
 // - [ ]: discover how we can discover different calls and responses (./src/dependencies/Multicaller.mocks.ts)
// - [ ]: Fix types (./src/components/cards/SwapCard/SwapRoute.vue)
 Dockerfile Dockerfile.dev LICENSE README.md - [ ].md auto-imports.d.ts components.d.ts crowdin.yml docker-compose.yml env.d.ts index.html package-lock.json package.json postcss.config.js prepare.js public scripts src stylelint.config.js tailwind.config.js tests tsconfig.json vercel-production-build.sh vite.config.ts TODO: (./src/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath.ts)
 .times(1 - protocolFeePercentage) // - [ ]: check pool type and use protocol yield percentage cache when applicable (./src/services/lido/lido.service.ts)
 // - [ ] BETTER INTEGRATION OF REWARD TOKEN APRS (./src/services/staking/staking-rewards.service.ts)
 // - [ ]: do this more elegantly (./src/services/pool/exchange/serializers/ExitParams.ts)
 // - [ ] type this (./src/services/web3/connectors/trustwallet/walletconnect.connector.ts)
 // - [ ] type this (./src/services/web3/connectors/gnosis/gnosis.connector.ts)
 // - [ ] type this (./src/services/web3/connectors/metamask/metamask.connector.ts)
 // - [ ] type this (./src/services/web3/connectors/walletlink/walletlink.connector.ts)
 // - [ ] type this (./src/services/web3/connectors/tally/tally.connector.ts)
 // - [ ]: Fix affected tests by refactoring export balancerContractsService (./src/services/balancer/contracts/balancer-contracts.service.ts)
 ? // - [ ]: Fix this in the SDK, then remove this toLowerCase (./src/services/balancer/pools/exits/handlers/exact-in-exit.handler.ts)
 // - [ ]: blocknative is going to be deprecated for transaction tracking. (./src/composables/useBlocknative.ts)
//- [ ]: FIX THIS (./src/composables/swap/useSwapping.spec.ts)
// - [ ]: What happens if the structure changes? Either keep a version or schema validator. (./src/composables/useTransactions.ts)
