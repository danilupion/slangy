import { Promisable } from 'type-fest';

export type InnerKeys<T> = {
  [K in keyof T]: keyof T[K];
}[keyof T];

export type FieldsWithMaybePromise<T> = {
  [K in keyof T]: Promisable<T[K]> | T[K];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Nullish<Type> = Type | null | undefined;
