import { captureException } from '@sentry/browser';
import axios, { AxiosResponse } from 'axios';
import { computed, ref } from 'vue';

import { configService } from '@/services/config/config.service';

class SubgraphFallbackService {
  private urlIndex = ref(0);

  public url = computed(() => {
    return this.urls[this.urlIndex.value];
  });

  constructor(private readonly urls = configService.subgraphUrls || []) {}

  public async get(payload: unknown): Promise<AxiosResponse | void> {
    try {
      const response = await axios.post(this.url.value, payload);
      const errorMessage = response.data.errors?.message;
      if (errorMessage) {
        throw new Error(errorMessage);
      }
      return response;
    } catch (error) {
      captureException(
        `GraphQL request to [${this.url.value}] failed with message: ${
          (error as Error).message
        }. Payload: ${payload}`
      );

      if (this.urlIndex.value + 1 > this.urls.length) {
        throw error;
      }

      this.incrementUrlIndex();
      this.get(payload);
    }
  }

  private incrementUrlIndex(): void {
    this.urlIndex.value += 1;
  }
}

export const subgraphFallbackService = new SubgraphFallbackService();
