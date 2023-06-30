export type WithDuration<
  Field extends string = 'duration',
  Required extends boolean = true,
> = Required extends true ? { [K in Field]: number } : { [K in Field]?: number };
