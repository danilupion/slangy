import { BadRequestError, ValidationError } from '@slangy/common/rest/error.js';
import { stringify } from 'qs';

import {
  createInitForDelete,
  createInitForGet,
  createInitForPatch,
  createInitForPost,
  createInitForPut,
} from './init.js';

type SafeResponse<Data> = Omit<Response, 'json'> & {
  json: () => Promise<Data>;
};

type BadRequestResponse = SafeResponse<ValidationError>;

const statusMiddleware = async <Res>(res: SafeResponse<Res> | BadRequestResponse) => {
  switch (res.status) {
    case 400: {
      const validationErrors = await (res as BadRequestResponse).json();
      throw new BadRequestError('Bad request error', validationErrors);
    }
    case 401: {
      // TODO: handle unauthorized
      return res as SafeResponse<Res>;
    }
    default: {
      if (res.status >= 400) {
        // TODO: consider using a custom error class (maybe the one implemented in turbo-server -moving it to turbo-common-)
        const error = new Error('Request failed');
        error.cause = res.status;
        throw error;
      }

      return res as SafeResponse<Res>;
    }
  }
};

const jsonMiddleware = <Res>(res: SafeResponse<Res>) => res.json() as Promise<Res>;

const jsonFetch = async <Res, NoResponse>(
  url: string,
  init: RequestInit,
  noResponse: NoResponse,
): Promise<NoResponse extends true ? void : Res> => {
  const result = await fetch(url, init).then(statusMiddleware);

  if (noResponse) {
    return undefined as never;
  }

  return (await jsonMiddleware<Res>(result)) as NoResponse extends true ? void : Res;
};

const bodilessRequest =
  (initFactory: () => RequestInit, noResponse = false) =>
  <Res, NoResponse extends boolean = false>(url: string) => {
    return jsonFetch<Res, NoResponse>(
      url,
      {
        ...initFactory(),
      },
      noResponse as NoResponse,
    );
  };

const request =
  (initFactory: () => RequestInit, noResponse = false) =>
  <Body, Res, NoResponse extends boolean = false>(url: string, data: Body) =>
    jsonFetch<Res, NoResponse>(
      url,
      {
        ...initFactory(),
        body: JSON.stringify(data),
      },
      noResponse as NoResponse,
    );

export const urlWithQuery = <Query extends object>(url: string, params: Query) => {
  return `${url}?${stringify(params)}`;
};

export const getRequest = bodilessRequest(createInitForGet);
export const postRequest = request(createInitForPost);
export const responselessPostRequest = request(createInitForPost, true);
export const bodilessPostRequest = bodilessRequest(createInitForPost);
export const patchRequest = request(createInitForPatch);
export const responselessPatchRequest = request(createInitForPatch, true);
export const bodilessPatchRequest = bodilessRequest(createInitForPatch);
export const putRequest = request(createInitForPut);
export const responselessPutRequest = request(createInitForPut, true);
export const bodilessPutRequest = bodilessRequest(createInitForPut);
export const deleteRequest = bodilessRequest(createInitForDelete, true);
