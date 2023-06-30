export type WithCreated<Field extends string = 'created'> = { [key in Field]: Date };

export type WithUpdated<Field extends string = 'updated'> = { [key in Field]?: Date };

export type WithTimestamps<
  CreatedField extends string = 'created',
  UpdatedField extends string = 'updated',
> = WithCreated<CreatedField> & WithUpdated<UpdatedField>;
