import { password } from '@slangy/common/regex.js';
import { compare, hash } from 'bcrypt';
import { Schema, SchemaDefinition } from 'mongoose';

export type WithPassword<
  Field extends string = 'password',
  ComparisonFunction extends string = 'comparePassword',
> = {
  [key in Field]: string;
} & { [key in ComparisonFunction]: (password: string) => Promise<boolean> };

interface PasswordMiddlewareOptions {
  field?: string;
  required?: boolean;
  saltingRounds?: number;
  comparisonFunction?: string;
  match?: RegExp;
  doesNotMatchMessage?: string;
}

const passwordMiddleware = (
  schema: Schema,
  {
    field = 'password',
    required = true,
    saltingRounds = 10,
    comparisonFunction = 'comparePassword',
    match = password,
    doesNotMatchMessage,
  }: PasswordMiddlewareOptions = {},
): void => {
  const fieldDescription: SchemaDefinition = {
    [field]: {
      type: String,
      required,
      match: doesNotMatchMessage ? [match, doesNotMatchMessage] : match,
    },
  };

  schema.add(fieldDescription);

  schema.pre('save', async function schemaWithPasswordPreSave(next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified(field)) {
      return next(null);
    }

    try {
      // generate a hash and override the clear text password with the hashed one
      this.set(field, await hash(this.get(field), saltingRounds));
      next(null);
    } catch (err) {
      if (err instanceof Error) {
        return next(err);
      }
    }
  });

  schema.methods[comparisonFunction] = function comparePassword(
    candidate: string,
  ): Promise<boolean> {
    return compare(candidate, (this as WithPassword).password).catch(() => false);
  };
};

export default passwordMiddleware;
