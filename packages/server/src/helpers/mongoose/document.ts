import { Document } from 'mongoose';

export const merge = <T>(target: Document<T>, source: Partial<T>) => {
  for (const [key, value] of Object.entries(source)) {
    target.set(key, value);
  }
};
