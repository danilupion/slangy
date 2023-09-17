import { FieldsWithMaybePromise } from '@slangy/common/types.js';
import { Document, FilterQuery, Model } from 'mongoose';

export const awaitForAllFields = async <T extends { [key: string]: unknown }>(
  model: T,
): Promise<T> => {
  const processValue = async (value: unknown): Promise<unknown> => {
    // If value is a Promise, await it
    if (value instanceof Promise) {
      return await value;
    }
    // If value is an object, recursively process it
    else if (typeof value === 'object' && value !== null) {
      // If value is a Document, return it
      if ('_id' in value) {
        return value;
      }
      // If value is an array, process each element
      else if (Array.isArray(value)) {
        return await Promise.all(value.map(processValue));
      }
      // If value is an object, process each field
      else {
        return await awaitForAllFields(value as { [key: string]: unknown });
      }
    }
    // Otherwise, return value as-is
    return value;
  };

  const processedEntries = await Promise.all(
    Object.entries(model).map(async ([key, value]) => {
      return { [key]: await processValue(value) };
    }),
  );

  return processedEntries.reduce((acc, curr) => ({ ...acc, ...curr }), {}) as T;
};

export const createOrUpdate = async <T extends Document>(
  M: Model<T>,
  query: FilterQuery<T>,
  data: Partial<T>,
  { validateBeforeSave = true }: { validateBeforeSave?: boolean } = {},
): Promise<[T, boolean]> => {
  const existingModel = await M.findOne(query);
  if (!existingModel) {
    const newModel = new M(data);
    await newModel.save({ validateBeforeSave });
    return [newModel, true];
  } else {
    for (const [key, value] of Object.entries(data)) {
      existingModel.set(key, value);
    }
    await existingModel.save();
  }

  return [existingModel, false];
};

export const seedFactory =
  <T>() =>
  (fields: () => FieldsWithMaybePromise<T>) =>
  async (extraFields: FieldsWithMaybePromise<T> = {} as FieldsWithMaybePromise<T>): Promise<T> => {
    return (await awaitForAllFields({ ...fields(), ...extraFields })) as T;
  };
