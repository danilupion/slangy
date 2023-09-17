import { Schema, SchemaDefinition } from 'mongoose';

interface DurationMiddlewareOptions {
  field?: string;
  required?: boolean;
}

const durationMiddleware = (
  schema: Schema,
  { field = 'duration', required = true }: DurationMiddlewareOptions = {},
): void => {
  const fieldDescription: SchemaDefinition = {
    [field]: {
      // Time in milliseconds
      type: Number,
      required,
    },
  };

  schema.add(fieldDescription);
};

export default durationMiddleware;
