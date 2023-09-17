import Method from '@slangy/common/http/method.js';

let token: string | undefined;

export const setToken = (newToken?: string) => {
  token = newToken;
};

const createDefaultInit = () => {
  const headers: HeadersInit = {
    'content-type': 'application/json',
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const init: RequestInit = {
    cache: 'no-cache',
    credentials: 'same-origin',
    headers,
    redirect: 'follow',
    referrer: 'no-referrer',
  };

  return init;
};

const createInitFactory = (requestMethod: Method) => () => ({
  ...createDefaultInit(),
  method: requestMethod.toUpperCase(),
});

export const createInitForGet = createInitFactory(Method.GET);
export const createInitForPost = createInitFactory(Method.POST);
export const createInitForPut = createInitFactory(Method.PUT);
export const createInitForPatch = createInitFactory(Method.PATCH);
export const createInitForDelete = createInitFactory(Method.DELETE);
