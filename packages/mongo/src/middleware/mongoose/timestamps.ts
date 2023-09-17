import { Schema } from 'mongoose';

export interface TimestampsMiddlewareOptions {
  creation?: boolean;
  update?: boolean;
  creationField?: string;
  updateField?: string;
  indexCreation?: boolean;
  indexUpdate?: boolean;
  updateTimestampOnCreation?: boolean;
}

const timestampsMiddleware = (
  schema: Schema,
  {
    creation = true,
    update = true,
    creationField = 'created',
    updateField = 'updated',
    indexCreation = false,
    indexUpdate = false,
    updateTimestampOnCreation = false,
  }: TimestampsMiddlewareOptions = {},
): void => {
  if (creation) {
    schema.add({ [creationField]: Date });
  }

  if (update) {
    schema.add({ [updateField]: Date });
  }

  schema.pre('save', function schemaWithTimestampsPreSave(next) {
    try {
      const now = new Date();
      if (creation && this.isNew && !this.get(creationField)) {
        this.set(creationField, now);
      }
      if (update) {
        if (this.isNew) {
          this.set(updateField, updateTimestampOnCreation ? now : null);
        } else {
          this.set(updateField, now);
        }
      }
      next(null);
    } catch (err) {
      if (err instanceof Error) {
        next(err);
      }
    }
  });

  if (update) {
    schema.pre(['updateOne', 'findOneAndUpdate'], function schemaWithTimestampsPreUpdate() {
      this.set(updateField, new Date());
    });
  }

  if (creation && indexCreation !== false) {
    schema.path(creationField).index(indexCreation);
  }

  if (update && indexUpdate !== false) {
    schema.path(updateField).index(indexUpdate);
  }
};

export default timestampsMiddleware;
