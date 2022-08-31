### TransactionBuilder

The TransactionBuilder class should be used everywhere we submit transactions throughout the codebase.

Usage:

```ts
const txBuilder = new TransactionBuilder(signer);

// For contract calls.
const tx = await txBuilder.contract.sendTransaction({
  contractAddress,
  abi,
  action,
  params,
});

// For raw transactions
const tx = await txBuilder.raw.sendTransaction({ to, data });
```
