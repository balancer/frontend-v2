import { getAddress } from '@ethersproject/address';
import EventEmitter from 'events';
import { flatten, isArray, last, mapValues, nth } from 'lodash';
import { QueryKey } from 'react-query';
import { computed, reactive, Ref, ref, watch } from 'vue';
import { useQueries } from 'vue-query';

export function promisesEmitter(promises: Promise<any>[] | Promise<any>) {
  const emitter = new EventEmitter();
  if (isArray(promises)) {
    promises.map(promise =>
      promise.then(value => {
        emitter.emit('resolved', value);
      })
    );
    return emitter;
  }
  promises.then(value => {
    emitter.emit('resolved', value);
  });
  return emitter;
}

type QueryType = 'independent' | 'page_dependent' | 'normal';

type Promises = Record<
  string,
  {
    queryFn: (...args: any[]) => Promise<any> | Promise<any>[];
    dependencies?: Record<string, Ref>;
    init?: boolean;
    enabled?: Ref<boolean>;
    waitFor?: string[];
    streamResponses?: boolean;
    type?: QueryType;
    skip?: number;
  }
>;

export default function useQueryStreams(id: string, promises: Promises) {
  const result = ref<any[]>([]);
  const currentPage = ref(1);
  const currentPageData = ref(result.value[result.value.length - 1]);

  watch(currentPageData, () => {
    console.log(
      'curr page',
      (currentPageData.value || []).map(pool => pool.tokenAddresses)
    );
  });
  // watch(
  //   result,
  //   () => {
  //     currentPageData.value = result.value[result.value.length - 1];
  //   },
  //   {
  //     deep: true
  //   }
  // );

  const successStates = ref(
    Object.fromEntries(
      Object.keys(promises).map(promiseKey => [promiseKey, false])
    )
  );

  const internalData = ref(
    Object.fromEntries(
      Object.keys(promises).map(promiseKey => [promiseKey, undefined])
    )
  );

  const queries: {
    queryFn: (...args: any[]) => Promise<any>;
    queryKey: Ref<QueryKey>;
  }[] = [];

  Object.keys(promises).forEach(promiseKey => {
    const query = promises[promiseKey];

    // the initial query is the base query to use for pagination purposes,
    // so it needs to be responsible for the fetching of extra paginated data
    // if there is any. to do so we need to make it refetch on page changes
    // so we have to add a dependency to the query which tracks the page
    const dependencies =
      query.init || query.type === 'page_dependent'
        ? reactive(Object.assign({}, query.dependencies, { currentPage }))
        : query.dependencies || {};

    const template: any = {
      queryFn: async () => {
        // if not streaming responses, simply return the data from the function
        if (!query.streamResponses) {
          const res = await query.queryFn(
            currentPageData,
            internalData,
            currentPage,
            successStates
          );

          return res;
        }
        // otherwise setup an even emitter that emits a 'resolved' event
        // whenever a promises within a list of promises resolves, the
        // queryFn is an async fn so we have to await it to get the correct
        // return type even though it is a list of promises. (Otherwise it'll
        // be a Promise<Promise[]>, we need a Promise[])
        const emitter = promisesEmitter(
          await query.queryFn(
            currentPageData,
            internalData,
            currentPage,
            successStates
          )
        );
        // as each promise in the list is resolved, update the existing value
        // the event emitter is responsible for returning the 'whole' list
        // but with the modified item inside of it. this ensures that no
        // wacky splicing happens and its as simple as a replace
        emitter.on('resolved', value => {
          result.value[currentPage.value - 1] = value;
        });
      },
      queryKey: [id, promiseKey, dependencies] as any,
      enabled: computed(
        () =>
          (query.enabled?.value ?? true) &&
          (promises[promiseKey].waitFor || []).every(
            otherQueryId => successStates.value[otherQueryId] === true
          )
      ),
      refetchOnWindowFocus: false,
      // staleTime: 120000
    };
    template.onSuccess = response => {
      if (
        !query.streamResponses &&
        !['independent', 'page_dependent'].includes(query.type || '')
      ) {
        if (result.value.length < currentPage.value) {
          result.value.push(response);
          currentPageData.value = response;
        } else {
          result.value[currentPage.value - 1] = response;
          console.log(
            'oos',
            promiseKey,
            response.map(pool => pool.tokenAddresses)
          );
          currentPageData.value = response;
        }
      }
      successStates.value[promiseKey] = true;
      internalData.value[promiseKey] = response;
    };
    queries.push(reactive(template));
  });

  /** fetch the queries */
  const responses = useQueries(queries as any);

  const dataStates = computed(() => {
    type DataState = {
      [key: keyof typeof promises]: 'idle' | 'error' | 'loading' | 'success';
    };
    const statesPerPage: [number, DataState][] = [];

    for (let i = 0; i < currentPage.value; i++) {
      const states: {
        [key: keyof typeof promises]: 'idle' | 'error' | 'loading' | 'success';
      } = {};
      Object.keys(promises).forEach((promiseKey, j) => {
        states[promiseKey] = responses[j].status;
        statesPerPage.push([i, states]);
      });
    }
    return Object.fromEntries(statesPerPage);
  });

  const data = computed(() => {
    const pages: Record<string, any>[] = [];
    const data: {
      [key: keyof typeof promises]: any;
    } = {};
    Object.keys(promises).forEach((promiseKey, i) => {
      data[promiseKey] = responses[i].data;
    });
    pages.push(data);
    return data;
  });

  const isComplete = computed(() =>
    Object.values(last(Object.values(dataStates.value)) || []).every(
      state => state === 'success'
    )
  );

  const _result = computed(() => flatten(result.value));
  const currentDataStates = computed(
    () => last(Object.values(dataStates.value)) || {}
  );
  const isLoadingMore = computed(() => {
    if (Object.values(dataStates.value).length > 1) {
      if (
        Object.values(nth(Object.values(dataStates.value), -2) || {}).some(
          state => state === 'success'
        )
      ) {
        if (
          Object.values(last(Object.values(dataStates.value)) || {}).some(
            state => state === 'loading'
          )
        ) {
          return true;
        }
      }
    }
    return false;
  });

  function loadMore() {
    currentPage.value += 1;
    successStates.value = mapValues(successStates.value, (state, key) => {
      if (
        ['independent', 'paged_independent'].includes(promises[key].type || '')
      ) {
        return true;
      }
      return false;
    });
  }

  // watch(successStates, () => {
  //   console.log('succ', JSON.stringify(successStates.value));
  // })

  return {
    dataStates: currentDataStates,
    isComplete,
    data,
    result: _result,
    currentPage,
    isLoadingMore,
    successStates,
    loadMore
  };
}
