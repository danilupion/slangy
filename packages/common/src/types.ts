export type InnerKeys<T> = {
  [K in keyof T]: keyof T[K];
}[keyof T];

export type FieldsWithMaybePromise<T> = {
  [K in keyof T]: Promise<T[K]> | T[K];
};

export type ArrayElement<T> = T extends (infer E)[] ? E : never;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
