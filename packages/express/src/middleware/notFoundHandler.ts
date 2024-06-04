import { NotFound } from 'http-errors';

const notFoundHandler = (): void => {
  throw new NotFound();
};

export default notFoundHandler;
