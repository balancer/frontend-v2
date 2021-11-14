import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as beethovenxNftAbi } from '@/beethovenx/abi/BeethovenxNft.json';

export default class EarlyLudwigNft {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  async balanceOf(user: string): Promise<string> {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      beethovenxNftAbi
    );

    const result = await multicaller
      .call('balanceOf', this.address, 'balanceOf', [user])
      .execute();

    return result.balanceOf.toString();
  }

  async tokenOfOwnerByIndex(user: string, index: number) {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      beethovenxNftAbi
    );

    const result = await multicaller
      .call('tokenOfOwnerByIndex', this.address, 'tokenOfOwnerByIndex', [
        user,
        index
      ])
      .execute();

    return result.tokenOfOwnerByIndex.toString();
  }

  async tokenURI(tokenId: number) {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      beethovenxNftAbi
    );

    const result = await multicaller
      .call('tokenURI', this.address, 'tokenURI', [tokenId])
      .execute();

    return result.tokenURI.toString();
  }

  public get address(): string {
    return this.service.config.addresses.earlyLudwigNft || '';
  }
}
