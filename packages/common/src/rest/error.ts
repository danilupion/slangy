export type ValidationError = { [key: string]: string[] };

export class BadRequestError extends Error {
  constructor(message: string, public readonly errors: ValidationError) {
    super(message);
    this.name = 'BadRequestError';
  }
}
