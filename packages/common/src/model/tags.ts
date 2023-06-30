export type WithTags<Field extends string = 'tags'> = { [key in Field]: string[] };
