import useSWR, { SWRResponse } from 'swr';

type CreateFetchHookParams<T, DataKey extends string> = {
  fetcher: () => Promise<T>;
  swrKey: string;
  dataKey?: DataKey;
  defaultData?: T;
};

type HookResponse<T, DataKey extends string> = {
  [key in DataKey]: T;
} & Omit<SWRResponse<T>, 'data'>;

const createFetchHook =
  <T, DataKey extends string = 'data'>({
    fetcher,
    swrKey,
    dataKey = 'data' as DataKey,
    defaultData,
  }: CreateFetchHookParams<T, DataKey>) =>
  () => {
    const { data = defaultData, ...rest } = useSWR(swrKey, fetcher);
    return {
      [dataKey]: data,
      ...rest,
    } as HookResponse<T, DataKey>;
  };

export default createFetchHook;
