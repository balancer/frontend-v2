import EventEmitter from 'events';
import {
  flatten,
  get,
  isArray,
  last,
  mapValues,
  merge,
  nth,
  tail,
} from 'lodash';
import { QueryKey } from 'react-query';
import { computed, reactive, Ref, ref, watch } from 'vue';
import { useQueries } from 'vue-query';

export function queryTemplatesEmitter(
  queryTemplates: Promise<any>[] | Promise<any>
) {
  const emitter = new EventEmitter();
  if (isArray(queryTemplates)) {
    queryTemplates.map(promise =>
      promise.then(value => {
        emitter.emit('resolved', value);
      })
    );
    return emitter;
  }
  queryTemplates.then(value => {
    emitter.emit('resolved', value);
  });
  return emitter;
}

type QueryType = 'independent' | 'page_dependent' | 'normal';

type queryTemplates = Record<
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

const result = ref<Record<string, any[]>>({});

export default function useQueryStreams(
  id: string,
  queryTemplates: queryTemplates
) {
  const currentPage = ref(1);
  const initQuery = computed(() =>
    Object.values(queryTemplates).find(query => query.init === true)
  );
  if (!initQuery.value) {
    throw new Error(
      `A set of parallel queries needs an initial query. Please mark one of the passed queries as [init].`
    );
  }
  const initialQueryHash = computed(() =>
    JSON.stringify(initQuery.value?.dependencies)
  );

  const currentPageData = ref(
    (result.value[initialQueryHash.value] || [])[
      result.value[initialQueryHash.value]?.length - 1
    ]
  );

  // success states are keyed by the query hash first, and then the id
  // of the query. As query hashes may represent different filters etc
  const successStates = ref({
    [initialQueryHash.value]: Object.fromEntries(
      Object.keys(queryTemplates).map(queryKey => [queryKey, false])
    ),
  });

  // Same as success, internal data is keyed by the query hash first, and then the id
  // of the query. As query hashes may represent different filters etc
  const internalData = ref({
    [initialQueryHash.value]: Object.fromEntries(
      Object.keys(queryTemplates).map(queryKey => [queryKey, undefined])
    ),
  });

  // when the query hash changes. e.g. when a filter is hit
  // we need to handle it by first, creating the new success and internal
  // data objects for that query hash. BUT we also need to persist independent
  // data, so everything can continue to work smoothly as independent data
  // should always be there!
  watch(initialQueryHash, () => {
    // first find the independent queries
    const independentQueries = Object.keys(queryTemplates).filter(queryKey =>
      ['independent', 'paged_independent'].includes(
        queryTemplates[queryKey].type || ''
      )
    );
    // seed the internal data
    internalData.value[initialQueryHash.value] = Object.fromEntries(
      Object.keys(queryTemplates).map(queryKey => {
        let value = undefined;
        // find the independent values
        if (independentQueries.includes(queryKey)) {
          const independentData = Object.values(internalData.value)[0][
            queryKey
          ];
          value = independentData;
        }
        return [queryKey, value];
      })
    );
    successStates.value[initialQueryHash.value] = Object.fromEntries(
      Object.keys(queryTemplates).map(queryKey => {
        let state = false;
        if (independentQueries.includes(queryKey)) {
          state = true;
        }
        return [queryKey, state];
      })
    );
  });

  const queries: {
    queryFn: (...args: any[]) => Promise<any>;
    queryKey: Ref<QueryKey>;
  }[] = [];

  // when the initial query has changes we want to wipe everything
  // but the first page to reset pagination
  Object.keys(queryTemplates).forEach(queryKey => {
    const query = queryTemplates[queryKey];

    // the initial query is the base query to use for pagination purposes,
    // so it needs to be responsible for the fetching of extra paginated data
    // if there is any. to do so we need to make it refetch on page changes
    // so we have to add a dependency to the query which tracks the page
    const otherQueryDependency = computed(() => {
      return (query.waitFor || []).map(queryId => {
        if (queryId.includes('.')) {
          return (
            internalData.value[initialQueryHash.value][queryId.split('.')[0]] ||
            []
          ).map(data => get(data, tail(queryId.split('.')).join('.')));
        }
        return internalData.value[queryId];
      });
    });
    const dependencies =
      query.init || query.type === 'page_dependent'
        ? reactive(
            Object.assign({}, query.dependencies, {
              currentPage,
              otherQueryDependency,
            })
          )
        : reactive(
            Object.assign({}, query.dependencies, {
              otherQueryDependency,
            })
          ) || {};

    const template: any = {
      queryFn: async () => {
        // if not streaming responses, simply return the data from the function
        if (!query.streamResponses) {
          const res = await query.queryFn(
            currentPageData,
            ref(internalData.value[initialQueryHash.value]),
            currentPage,
            successStates,
            initialQueryHash
          );

          return res;
        }
        // otherwise setup an even emitter that emits a 'resolved' event
        // whenever a queryTemplates within a list of queryTemplates resolves, the
        // queryFn is an async fn so we have to await it to get the correct
        // return type even though it is a list of queryTemplates. (Otherwise it'll
        // be a Promise<Promise[]>, we need a Promise[])
        const emitter = queryTemplatesEmitter(
          await query.queryFn(
            currentPageData,
            ref(internalData.value[initialQueryHash.value]),
            currentPage,
            successStates
          )
        );
        // as each promise in the list is resolved, update the existing value
        // the event emitter is responsible for returning the 'whole' list
        // but with the modified item inside of it. this ensures that no
        // wacky splicing happens and its as simple as a replace
        emitter.on('resolved', value => {
          result.value[initialQueryHash.value][currentPage.value - 1] = value;
        });
      },
      queryKey: [id, queryKey, dependencies] as any,
      enabled: computed(
        () =>
          (query.enabled?.value ?? true) &&
          (queryTemplates[queryKey].waitFor || []).every(
            otherQueryId =>
              successStates.value[initialQueryHash.value][
                otherQueryId.split('.')[0]
              ] === true
          )
      ),
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    };
    template.onSuccess = response => {
      if (
        !query.streamResponses &&
        !['independent', 'page_dependent'].includes(query.type || '')
      ) {
        if (!result.value[initialQueryHash.value]) {
          result.value[initialQueryHash.value] = [];
        }
        if (
          (result.value[initialQueryHash.value] || []).length <
          currentPage.value
        ) {
          result.value[initialQueryHash.value].push(response);
          currentPageData.value = response;
        } else {
          // merging here is important as we don't want to lose previous data
          // which defeats the purpose of caching
          result.value[initialQueryHash.value][currentPage.value - 1] = merge(
            result.value[initialQueryHash.value][currentPage.value - 1],
            response
          );
          currentPageData.value = response;
        }
      }
      if (!internalData.value[initialQueryHash.value]) {
        internalData.value[initialQueryHash.value] = {};
      }
      internalData.value[initialQueryHash.value][queryKey] = response;
      successStates.value[initialQueryHash.value][queryKey] = true;
    };
    queries.push(reactive(template));
  });

  /** fetch the queries */
  const responses = useQueries(queries as any);

  const dataStates = computed(() => {
    type DataState = {
      [key: keyof typeof queryTemplates]:
        | 'idle'
        | 'error'
        | 'loading'
        | 'success';
    };
    const statesPerPage: [number, DataState][] = [];

    for (let i = 0; i < currentPage.value; i++) {
      const states: {
        [key: keyof typeof queryTemplates]:
          | 'idle'
          | 'error'
          | 'loading'
          | 'success';
      } = {};
      Object.keys(queryTemplates).forEach((queryKey, j) => {
        states[queryKey] = responses[j].status;
        statesPerPage.push([i, states]);
      });
    }
    return Object.fromEntries(statesPerPage);
  });

  const isComplete = computed(() =>
    Object.values(last(Object.values(dataStates.value)) || []).every(
      state => state === 'success'
    )
  );

  const _result = computed(() => flatten(result.value[initialQueryHash.value]));
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
    successStates.value[initialQueryHash.value] = mapValues(
      successStates.value[initialQueryHash.value],
      (state, key) => {
        if (
          ['independent', 'paged_independent'].includes(
            queryTemplates[key].type || ''
          )
        ) {
          return true;
        }
        return false;
      }
    );
  }

  return {
    dataStates: currentDataStates,
    isComplete,
    result: _result,
    currentPage,
    isLoadingMore,
    loadMore,
  };
}
