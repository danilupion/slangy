import { Schema } from 'mongoose';

export interface TagsMiddlewareOptions {
  field?: string;
}

const tagsMiddleware = (schema: Schema, { field = 'tags' }: TagsMiddlewareOptions = {}): void => {
  schema.add({
    [field]: {
      type: [String],
      required: true,
      default: [],
    },
  });
};

export default tagsMiddleware;
