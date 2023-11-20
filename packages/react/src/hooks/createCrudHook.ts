import { useEffect, useState } from 'react';

import { CrudStore } from '../stores/createCrudStore.js';

/**
 * A function that removes an item from a collection based on its ID.
 *
 * @template Item The type of the collection item.
 * @template ItemId The type of the item's identifier.
 */
type CrudRemover<Item, ItemId extends keyof Item> = (itemId: Item[ItemId]) => Promise<void>;

/**
 * Parameters required to create a custom CRUD hook.
 *
 * @template ReaderArgs The types of arguments accepted by the read function.
 * @template CreateItemType The type of item being created.
 * @template UpdateItemType The type of item being updated.
 * @template ReaderReturnType The type of data returned from the read function.
 * @template Extra Any extra properties or methods the resulting hook should have.
 * @template TransformedType The type of data returned after optional transformation.
 * @template ItemId The type of the item's identifier in the transformed data.
 * @template Remover The type for the remove function.
 */
type CreateCrudHookParams<
  ReaderArgs extends unknown[],
  CreateItemType,
  UpdateItemType,
  ReaderReturnType,
  Extra,
  TransformedType,
  ItemId extends keyof TransformedType,
  Remover extends CrudRemover<TransformedType, ItemId>,
> = {
  store: () => CrudStore<TransformedType, ItemId>;
  create: (item: CreateItemType) => Promise<TransformedType>;
  read: (...args: ReaderArgs) => Promise<ReaderReturnType>;
  update: (item: UpdateItemType) => Promise<TransformedType>;
  remove: Remover;
  transform?: (data?: ReaderReturnType) => TransformedType[];
  extra?: (data: TransformedType[]) => Extra;
};

/**
 * A utility hook to create a custom CRUD hook with optional data transformation.
 *
 * @template ReaderArgs The types of arguments accepted by the read function.
 * @template CreateItemType The type of item being created.
 * @template UpdateItemType The type of item being updated.
 * @template ReaderReturnType The type of data returned from the read function.
 * @template Extra Any extra properties or methods the resulting hook should have.
 * @template TransformedType The type of data returned after optional transformation.
 * @template ItemId The type of the item's identifier in the transformed data.
 * @template Remove The type for the remove function.
 */
const createCrudHook = <
  ReaderArgs extends unknown[],
  CreateItemType,
  UpdateItemType,
  ReaderReturnType,
  Extra,
  TransformedType = ReaderReturnType,
  ItemId extends keyof TransformedType = 'id' extends keyof TransformedType ? 'id' : never,
  Remove extends CrudRemover<TransformedType, ItemId> = CrudRemover<TransformedType, ItemId>,
>({
  store,
  create,
  read,
  update,
  remove,
  transform = (data) => data as TransformedType[],
  extra,
}: CreateCrudHookParams<
  ReaderArgs,
  CreateItemType,
  UpdateItemType,
  ReaderReturnType,
  Extra,
  TransformedType,
  ItemId,
  Remove
>) => {
  /**
   * Hook that provides CRUD operations and manages data state.
   *
   * @param args The arguments required for the read operation.
   * @returns object An object containing data, loading error and CRUD operations (and fields from extra factory).
   */
  return function useData(...args: ReaderArgs) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [hasLoaded, setHasLoaded] = useState(false);

    const {
      data,
      set,
      create: createInStore,
      update: updateInStore,
      remove: removeFromStore,
    } = store();

    const shouldFetchData = !hasLoaded && !isLoading && !error;

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        setError(undefined);
        try {
          const result = await read(...args);
          set(transform(result));
          setHasLoaded(true);
        } catch (err) {
          setError(err as Error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldFetchData]);

    useEffect(() => {
      hasLoaded && setHasLoaded(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...args]);

    const extraProperties = extra ? extra(data) : undefined;

    const hook = {
      data: data,
      error: error,
      isLoading: isLoading,
      async create(item: CreateItemType) {
        const newItem = await create(item);
        createInStore(newItem);
      },
      async remove(itemId: TransformedType[ItemId]) {
        await remove(itemId);
        removeFromStore(itemId);
      },
      async update(item: UpdateItemType) {
        const updatedItem = await update(item);
        updateInStore(updatedItem);
      },
    };

    return {
      ...hook,
      ...(extraProperties as Extra),
    };
  };
};

export default createCrudHook;
