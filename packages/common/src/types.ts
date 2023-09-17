export type InnerKeys<T> = {
  [K in keyof T]: keyof T[K];
}[keyof T];

export type FieldsWithMaybePromise<T> = {
  [K in keyof T]: Promise<T[K]> | T[K];
};
