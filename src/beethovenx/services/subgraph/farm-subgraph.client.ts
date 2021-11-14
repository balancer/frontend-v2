import axios from 'axios';
import { configService as _configService } from '@/services/config/config.service';

export default class FarmSubgraphClient {
  url: string;

  constructor(private readonly configService = _configService) {
    this.url = configService.network.farmSubgraph || '';
  }

  public async getFarms() {
    const query = `
    query {
      farms: pools(
        first: 1000
        skip: 0
        orderBy: "id"
        orderDirection: "desc"
      ) {
        id
        pair
        allocPoint
        slpBalance
        masterChef {
          id
          totalAllocPoint
          beetsPerBlock
        }
        rewarder {
          id
          rewardToken
          rewardPerSecond
        }
      }
    }
    `;

    return this.get(query);
  }

  public async getFarm(id: string) {
    const query = `
    query {
      farm: pool(id: "${id}") {
        id
        pair
        allocPoint
        slpBalance
        masterChef {
          id
          totalAllocPoint
          beetsPerBlock
        }
        rewarder {
          id
          rewardToken
          rewardPerSecond
        }
      }
    }
    `;

    return this.get(query);
  }

  public async getUserDataForFarm(farmId: string, userAddress: string) {
    const query = `
    query {
      user: user(id: "${farmId}-${userAddress.toLowerCase()}") {
        id
        amount
        rewardDebt
        beetsHarvested
        pool {
          id
        }
      }
    }
    `;

    const data = await this.get(query);

    return data.user
      ? data.user
      : { amount: 0, rewardDebt: 0, beetsHarvested: 0 };
  }

  public async getUserDataForAllFarms(userAddress: string) {
    const query = `
    query {
      farmData: users(where: { address: "${userAddress.toLowerCase()}" }) {
        id
        amount
        rewardDebt
        beetsHarvested
        pool {
          id
        }
      }
    }
    `;

    const data = await this.get(query);

    return data.farmData || [];
  }

  private async get(query) {
    try {
      const {
        data: { data }
      } = await axios.post(
        this.url,
        { query },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

export const farmSubgraphClient = new FarmSubgraphClient();
