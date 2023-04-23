export type ApiModel<BaseModel, Id = number> = BaseModel & {
  id: Id;
};
