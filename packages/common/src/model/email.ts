export type WithEmail<
  Field extends string = 'email',
  Required extends boolean = true,
> = Required extends true ? { [key in Field]: string } : { [key in Field]?: string };
