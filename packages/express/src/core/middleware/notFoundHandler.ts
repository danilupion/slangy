import createError from 'http-errors';

const notFoundHandler = (): void => {
  throw new createError.NotFound();
};

export default notFoundHandler;
