export declare type QueryKey = string | readonly unknown[];


export type QueryFunctionRequest<T> = {
  queryKey: [string, T];
  pageParam?: any;
};
