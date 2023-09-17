import { email } from '@slangy/common/regex.js';
import { Schema, SchemaDefinition } from 'mongoose';

interface EmailMiddlewareOptions {
  field?: string;
  required?: boolean;
  unique?: boolean;
  index?: boolean;
  match?: RegExp;
  doesNotMatchMessage?: string;
}

const emailMiddleware = (
  schema: Schema,
  {
    field = 'email',
    required = true,
    unique = true,
    index = true,
    match = email,
    doesNotMatchMessage,
  }: EmailMiddlewareOptions = {},
): void => {
  const fieldDescription: SchemaDefinition = {
    [field]: {
      type: String,
      trim: true,
      required,
      unique,
      index,
      match: doesNotMatchMessage ? [match, doesNotMatchMessage] : match,
    },
  };

  schema.add(fieldDescription);
};

export default emailMiddleware;
