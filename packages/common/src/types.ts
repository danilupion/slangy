export type InnerKeys<T> = {
  [K in keyof T]: keyof T[K];
}[keyof T];

export type FieldsWithMaybePromise<T> = {
  [K in keyof T]: Promise<T[K]> | T[K];
};

export type ArrayElement<T> = T extends (infer E)[] ? E : never;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Serializable = string | number | boolean | Date | SerializableObject | SerializableArray;
type SerializableObject = { [key: string]: Serializable };
type SerializableArray = Array<Serializable>;

export type Serialized<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? Array<Serialized<U>>
    : T[K] extends Date
    ? string
    : T[K] extends object
    ? Serialized<T[K]>
    : T[K];
};
