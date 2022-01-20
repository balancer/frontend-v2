import Vault from './vault';
import { Contract } from 'ethers';
import { formatUnits } from '@ethersproject/units';
import ProtocolFeesCollectorAbi from '@/lib/abi/ProtocolFeesCollector.json';

export default class ProtocolFeesCollector {
  address?: string;
  instance?: Contract;

  /**
   * @summary Interface to the vaults protocol fees collector contract.
   * @description Requires vault instance since this is where the
   * protocol fees collector address is set.
   * @param vault instantiated Vault class
   */
  constructor(private readonly vault: Vault) {}

  /**
   * @summary Fetches protocol fee collector contract address.
   * @returns contract address
   */
  public async getAddress(): Promise<string> {
    return (await this.vault.instance.getProtocolFeesCollector()) as string;
  }

  /**
   * @summary Instantiates a contract instance for the protocol fees collector.
   * @returns Ethers Contract instance
   */
  public async getInstance(): Promise<Contract> {
    this.address = await this.getAddress();
    return new Contract(
      this.address,
      ProtocolFeesCollectorAbi,
      this.vault.service.provider
    );
  }

  /**
   * @summary Fetches protcol fee percentage.
   * @returns percentage as fractional number, e.g. 0.1 = 10%
   */
  public async getSwapFeePercentage(): Promise<number> {
    this.instance = await this.getInstance();
    const scaledPercentage = await this.instance.getSwapFeePercentage();
    return Number(formatUnits(scaledPercentage, 18));
  }
}
