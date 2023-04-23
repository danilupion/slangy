import { ClientErrorNotFound } from '../../helpers/httpError.js';

export default (): void => {
  throw new ClientErrorNotFound();
};
