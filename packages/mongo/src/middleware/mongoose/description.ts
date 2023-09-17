import { Schema, SchemaDefinition } from 'mongoose';

interface DescriptionMiddlewareOptions {
  field?: string;
  required?: boolean;
}

const descriptionMiddleware = (
  schema: Schema,
  { field = 'description', required = true }: DescriptionMiddlewareOptions = {},
): void => {
  const fieldDescription: SchemaDefinition = {
    [field]: {
      type: String,
      trim: true,
      required,
      default: '',
    },
  };

  schema.add(fieldDescription);
};

export default descriptionMiddleware;
