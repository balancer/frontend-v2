import { captureException } from '@sentry/browser';
import axios, { AxiosResponse } from 'axios';
import { computed, ref } from 'vue';

import { configService } from '@/services/config/config.service';

class SubgraphFallbackService {
  private subgraphUrlIndex = ref(0);

  public isSingleSubgraphUrl = computed(() => this.subgraphUrls.length === 0);
  public currentSubGraphUrl = computed(() => {
    if (this.isSingleSubgraphUrl.value) {
      return this.url;
    }
    return this.subgraphUrls[this.subgraphUrlIndex.value];
  });

  constructor(
    private readonly url = configService.subgraph,
    private readonly subgraphUrls = configService.subgraphUrls || []
  ) {}

  public async get(payload: unknown): Promise<AxiosResponse | void> {
    try {
      const response = await axios.post(this.currentSubGraphUrl.value, payload);
      const errorMessage = response.data.errors?.message;
      if (errorMessage) {
        throw new Error(errorMessage);
      }
      return response;
    } catch (error) {
      if (this.isSingleSubgraphUrl.value) {
        throw error;
      }

      captureException(
        `GraphQL request to [${
          this.currentSubGraphUrl.value
        }] failed with message: ${
          (error as Error).message
        }. Payload: ${payload}`
      );
      this.changeSubgraphUrlIndex();

      if (this.subgraphUrlIndex.value + 1 > this.subgraphUrls.length) {
        throw error;
      }
      this.get(payload);
    }
  }

  private changeSubgraphUrlIndex(): void {
    this.subgraphUrlIndex.value += 1;
  }
}

export const subgraphFallbackService = new SubgraphFallbackService();
