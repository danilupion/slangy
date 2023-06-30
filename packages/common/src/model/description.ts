export type WithDescription<
  Field extends string = 'description',
  Required extends boolean = true,
> = Required extends true ? { [key in Field]: string } : { [key in Field]?: string };
