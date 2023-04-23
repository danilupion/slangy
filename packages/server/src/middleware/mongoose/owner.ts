import { Schema, Types } from 'mongoose';

export interface OwnerMiddlewareOptions {
  field?: string;
  required?: boolean;
  defaultValue?: undefined;
  ref?: string;
  index?: boolean;
}

const ownerMiddleware = (
  schema: Schema,
  {
    field = 'user',
    required = true,
    defaultValue,
    ref = 'User',
    index = true,
  }: OwnerMiddlewareOptions = {},
): void => {
  schema.add({
    [field]: {
      type: Types.ObjectId,
      default: defaultValue,
      required,
      ref,
      index,
    },
  });
};

export default ownerMiddleware;
