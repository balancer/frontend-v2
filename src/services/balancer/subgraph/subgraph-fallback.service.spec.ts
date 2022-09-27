import { configService } from '@/services/config/config.service';
import { SubgraphFallbackService } from './subgraph-fallback.service';

jest.mock('axios');

describe('Subgraph fallback service', () => {
  const subgraphFallbackService = new SubgraphFallbackService();

  it('Instantiates fallback service', () => {
    expect(subgraphFallbackService).toBeTruthy();
  });

  it('There should be at least one url', () => {
    expect(configService.subgraphUrls[0]).toBeTruthy();
  });

  it('Check first url in service', () => {
    expect(subgraphFallbackService.url.value).toBe(
      configService.subgraphUrls[0]
    );
  });

  it('Check epmty payload error', async () => {
    expect(subgraphFallbackService.get(undefined)).rejects.toThrowError();
  });
});
