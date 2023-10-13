import { create } from 'zustand';

/**
 * Return type of crudStoreFactory.
 *
 * @template ItemType The types of element the store holds.
 * @template ItemId The id of ItemType.
 */
export type CrudStore<ItemType, ItemId extends keyof ItemType> = {
  data: ItemType[];
  set: (items: ItemType[]) => void;
  create: (...items: ItemType[]) => void;
  remove: (idToRemove: ItemType[ItemId]) => void;
  update: (updatedItem: ItemType) => void;
};

/**
 * Parameters required to create a custom crud store.
 *
 * @template ItemType The types of element the store holds.
 * @template ItemId The id of ItemType.
 */
type CrudStoreFactoryParams<ItemType, ItemId extends keyof ItemType> = {
  idKey?: ItemId;
};

/**
 * A utility hook to create a custom zustand based crud store.
 * @param idKey
 */
const createCrudStore = <
  ItemType,
  ItemId extends keyof ItemType = 'id' extends keyof ItemType ? 'id' : never,
>({ idKey = 'id' as ItemId }: CrudStoreFactoryParams<ItemType, ItemId> = {}) =>
  create<CrudStore<ItemType, ItemId>>((setStore) => ({
    data: [],
    set: (items: ItemType[]) => {
      setStore(() => ({ data: [...items] }));
    },
    create: (...items: ItemType[]) => {
      setStore((state) => ({ data: [...state.data, ...items] }));
    },
    update: (updatedItem: ItemType) => {
      setStore((state) => ({
        data: state.data.map((item) => (item[idKey] === updatedItem[idKey] ? updatedItem : item)),
      }));
    },
    remove: (idToRemove: ItemType[ItemId]) => {
      setStore((state) => ({
        data: state.data.filter((item) => item[idKey] !== idToRemove),
      }));
    },
  }));

export default createCrudStore;
