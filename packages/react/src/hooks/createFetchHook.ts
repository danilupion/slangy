import useSWR, { SWRResponse } from 'swr';

/**
 * Describes the parameters required to create a custom fetch hook.
 *
 * @template FetcherArgs - The types of arguments accepted by the fetcher function.
 * @template FetcherReturnType - The type of data returned from the fetcher function.
 * @template TransformedType - The type of data returned from the transform function.
 */
type CreateFetchHookParams<
  FetcherArgs extends unknown[],
  FetcherReturnType,
  TransformedType, // This is a new type for the transformed data
> = {
  fetcher: (...args: FetcherArgs) => Promise<FetcherReturnType>;
  swrKey: string;
  transform?: (data?: FetcherReturnType) => TransformedType;
};

/**
 * The shape of the response from the custom hook.
 */
type HookResponse<T> = {
  data: T | undefined;
} & Omit<SWRResponse, 'data'>;

/**
 * A utility hook to create a custom SWR hook with optional data transformation.
 *
 * @param fetcher - The function used to fetch data.
 * @param swrKey - The caching key used by SWR.
 * @param transform - An optional function to transform or enrich the fetched data.
 * @returns HookResponse A custom hook tailored to the given configuration.
 */
const createFetchHook =
  <FetcherArgs extends unknown[], FetcherReturnType, TransformedType = FetcherReturnType>({
    fetcher,
    swrKey,
    transform = (data) => data as TransformedType,
  }: CreateFetchHookParams<FetcherArgs, FetcherReturnType, TransformedType>) =>
  (...args: FetcherArgs): HookResponse<TransformedType> => {
    const { data, ...rest } = useSWR([swrKey, args], ([, fetcherArgs]) => fetcher(...fetcherArgs));

    const transformedData = transform(data);

    return {
      ...rest,
      data: transformedData,
    };
  };

export default createFetchHook;
