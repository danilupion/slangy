import { Schema, SchemaDefinition } from 'mongoose';

type OauthProfile = {
  id: string;
  displayName: string;
  emails: string[];
  photos: string[];
};

export type WithOauthProfile<
  Field extends string,
  Parent extends string = 'profiles',
> = Parent extends never
  ? {
      [key in Field]?: OauthProfile;
    }
  : {
      [key in Parent]: { [key in Field]?: OauthProfile };
    };

interface OauthProfileMiddlewareOptions {
  field: string;
  parent?: string;
}

const oauthProfileMiddleware = (
  schema: Schema,
  { field, parent }: OauthProfileMiddlewareOptions,
): void => {
  const fieldDescription: SchemaDefinition = {
    [field]: {
      type: {
        id: { type: String, required: true },
        displayName: { type: String, required: true },
        emails: [String],
        photos: [String],
      },
    },
  };

  if (parent) {
    const parentDefinition = schema.path(parent);
    if (!parentDefinition) {
      schema.add({
        [parent]: { type: fieldDescription, default: {}, _id: false },
      });
    } else {
      parentDefinition.schema.add(fieldDescription);
    }
  } else {
    schema.add(fieldDescription);
  }
};

export default oauthProfileMiddleware;
