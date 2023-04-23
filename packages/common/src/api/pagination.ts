export type PageQuery = {
  page: number;
};

type PaginatedData<Data> = {
  data: Data[];
};

export type PaginatedResponse<Data, Meta = never> = Meta extends never
  ? PaginatedData<Data>
  : PaginatedData<Data> & { meta: Meta };
