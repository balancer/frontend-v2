import { QueryKey, QueryOptions } from 'react-query';
import { computed, Ref, ref } from 'vue';
import { useQueries } from 'vue-query';

type Promises = Record<
  string,
  {
    queryFn: (...args: any[]) => Promise<any>;
    dependencies?: Record<string, Ref>;
    init?: boolean;
    enabled?: Ref<boolean>;
  }
>;

export default function useQueryStreams(
  id: string,
  promises: Promises,
  options?: QueryOptions
) {
  const result = ref<any>();

  const queries: {
    queryFn: (...args: any[]) => Promise<any>;
    queryKey: Ref<QueryKey>;
  }[] = [];

  Object.keys(promises).forEach(promiseKey => {
    const query = promises[promiseKey];
    const template: any = {
      queryFn: () => query.queryFn(result),
      queryKey: [id, promiseKey, query.dependencies || {}] as any,
      enabled: query.enabled
    };
    template.onSuccess = response => {
      result.value = response;
    };
    queries.push(template);
  });
  const responses = useQueries(queries as any);
  const dataStates = computed(() => {
    const states: {
      [key: keyof typeof promises]: 'idle' | 'error' | 'loading' | 'success';
    } = {};
    Object.keys(promises).forEach((promiseKey, i) => {
      states[promiseKey] = responses[i].status;
    });
    return states;
  });

  const data = computed(() => {
    const data: {
      [key: keyof typeof promises]: any;
    } = {};
    Object.keys(promises).forEach((promiseKey, i) => {
      data[promiseKey] = responses[i].data;
    });
    return data;
  });
  const isComplete = computed(() =>
    Object.values(dataStates.value).every(state => state === 'success')
  );

  return {
    dataStates,
    isComplete,
    data,
    result
  };
}
