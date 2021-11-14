import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import axios from 'axios';
import useApp from '@/composables/useApp';
import { nftContractService } from '@/beethovenx/services/nft/nft-contracts.service';

export default function useNftQuery(
  options: QueryObserverOptions<string | null> = {}
) {
  /**
   * COMPOSABLES
   */
  const { appLoading } = useApp();
  const { account } = useWeb3();

  const enabled = computed(() => !appLoading.value);
  const queryKey = QUERY_KEYS.Account.Nft(account);

  const queryFn = async () => {
    if (!account.value) {
      return null;
    }
    const balance = await nftContractService.earlyLudwigNft.balanceOf(
      account.value
    );
    if (parseInt(balance) === 0) {
      return null;
    }

    // we just take the first nft
    const tokenId = await nftContractService.earlyLudwigNft.tokenOfOwnerByIndex(
      account.value,
      0
    );

    const ipfsMetadataUri = await nftContractService.earlyLudwigNft.tokenURI(
      tokenId
    );
    const metadataCid = ipfsMetadataUri.replace('ipfs://', '');
    const metadataResponse = await axios.get(
      `https://ipfs.io/ipfs/${metadataCid}`
    );
    const ipfsImageUri = metadataResponse.data.image;
    const imageCid = ipfsImageUri.replace('ipfs://', '');

    return `https://ipfs.io/ipfs/${imageCid}`;
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<string | null>(queryKey, queryFn, queryOptions);
}
