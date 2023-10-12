import useSWR, { SWRResponse } from 'swr';

/**
 * Represents the shape of the data holder.
 */
type DataHolder<T> = {
  data: T | undefined;
};

/**
 * Describes the parameters required to create a custom fetch hook.
 *
 * @template T - The type of data being fetched.
 * @template FetcherReturnType - The type of data returned from the fetcher function.
 * @template FetcherArgs - The types of arguments accepted by the fetcher function.
 * @template ExtraFields - Additional fields that can extend the data holder.
 */
type CreateFetchHookParams<
  T,
  FetcherReturnType,
  FetcherArgs extends unknown[],
  ExtraFields extends DataHolder<T>,
> = {
  fetcher: (...args: FetcherArgs) => Promise<FetcherReturnType>; // A function responsible for data fetching.
  swrKey: string; // The caching key used by SWR.
  transform?: (data?: FetcherReturnType) => ExtraFields; // An optional function to transform or enrich the data.
};

/**
 * The shape of the response from the custom hook.
 */
type HookResponse<T, ExtraFields> = {
  data: T | undefined;
} & ExtraFields &
  Omit<SWRResponse, 'data'>;

/**
 * A utility hook to create a custom SWR hook with optional data transformation.
 *
 * @param fetcher - The function used to fetch data.
 * @param swrKey - The caching key used by SWR.
 * @param transform - An optional function to transform or enrich the fetched data.
 * @returns HookResponse A custom hook tailored to the given configuration.
 */
const createFetchHook =
  <T, FetcherReturnType, FetcherArgs extends unknown[], ExtraFields extends DataHolder<T>>({
    fetcher,
    transform,
    swrKey,
  }: CreateFetchHookParams<T, FetcherReturnType, FetcherArgs, ExtraFields>) =>
  (...args: FetcherArgs): HookResponse<T, ExtraFields> => {
    const { data, ...rest } = useSWR([swrKey, args], ([, fetcherArgs]) => fetcher(...fetcherArgs));

    const transformedData = transform ? transform(data) : ({ data } as ExtraFields);

    return {
      ...rest,
      ...transformedData,
    };
  };

export default createFetchHook;
