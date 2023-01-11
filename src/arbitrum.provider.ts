import axios from 'axios';

export async function fetchArbitrumProvider(method: string) {
  try {
    const { data } = await axios.post(
      'https://arbitrum-mainnet.infura.io/v3/daaa68ec242643719749dd1caba2fc66',
      { method, id: 1, jsonrpc: '2.0' }
    );
  return data;
  } catch {
    console.log('post was not intercepted')
  }
}
