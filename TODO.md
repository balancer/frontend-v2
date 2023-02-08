./.github/workflows/todo.yml:name: Compile TODO Comments
./.github/workflows/todo.yml:    - name: Extract TODO comments
./.github/workflows/todo.yml:        # Extract all TODO comments into a file
./.github/workflows/todo.yml:        grep -r -E --exclude=TODO.md 'TODO' . > TODO.md
./.github/workflows/todo.yml:    - name: Commit TODO file
./.github/workflows/todo.yml:        add: 'TODO.md'
./.github/workflows/todo.yml:        message: 'Add TODO.md file [skip ci]'
./src/pages/pool/invest.vue:// TODO: Don't refetch whole pool, only update balances and weights with
./src/pages/pool/withdraw.vue:// TODO: Don't refetch whole pool, only update balances and weights with
./src/dependencies/balancer-sdk.mocks.ts:// TODO: move to sor mocks to subfile
./src/dependencies/balancer-sdk.mocks.ts://TODO: Improve builder to avoid DeepPartial
./src/dependencies/balancer-sdk.mocks.ts://TODO: why mock is not working
./src/dependencies/Multicaller.mocks.ts:  // TODO: discover how we can discover different calls and responses
./src/components/cards/SwapCard/SwapRoute.vue:// TODO: Fix types
./src/components/forms/pool_actions/WithdrawForm/composables/useWithdrawMath.ts: * TODO:
./src/services/lido/lido.service.ts:      .times(1 - protocolFeePercentage) // TODO: check pool type and use protocol yield percentage cache when applicable
./src/services/staking/staking-rewards.service.ts:        // TODO BETTER INTEGRATION OF REWARD TOKEN APRS
./src/services/pool/exchange/serializers/ExitParams.ts:      // TODO: do this more elegantly
./src/services/web3/connectors/trustwallet/walletconnect.connector.ts:      // TODO type this
./src/services/web3/connectors/gnosis/gnosis.connector.ts:      // TODO type this
./src/services/web3/connectors/metamask/metamask.connector.ts:      // TODO type this
./src/services/web3/connectors/walletlink/walletlink.connector.ts:      // TODO type this
./src/services/web3/connectors/tally/tally.connector.ts:      // TODO type this
./src/services/balancer/contracts/balancer-contracts.service.ts:    // TODO: Fix affected tests by refactoring export balancerContractsService
./src/services/balancer/pools/exits/handlers/exact-in-exit.handler.ts:        ? // TODO: Fix this in the SDK, then remove this toLowerCase
./src/composables/useBlocknative.ts:  // TODO: blocknative is going to be deprecated for transaction tracking.
./src/composables/swap/useSwapping.spec.ts://TODO: FIX THIS
./src/composables/useTransactions.ts:// TODO: What happens if the structure changes? Either keep a version or schema validator.
