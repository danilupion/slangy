import { ClientErrorStatusCode } from '@slangy/common/http/statusCode.js';
import { BadRequestError, ValidationError } from '@slangy/common/rest/error.js';
import { stringify } from 'qs';
import { Jsonify } from 'type-fest';

export const UnauthorizedErrorEvent = '@slangy/client:unauthorized';

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
    case ClientErrorStatusCode.ClientErrorBadRequest: {
      const validationErrors = await (res as BadRequestResponse).json();
      throw new BadRequestError('Bad request error', validationErrors);
    }
    case ClientErrorStatusCode.ClientErrorUnauthorized: {
      const event = new CustomEvent(UnauthorizedErrorEvent, { detail: res });
      window.dispatchEvent(event);
      throw event;
    }
    default: {
      if (res.status >= 402) {
        // TODO: consider using a custom error class
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
    return jsonFetch<Jsonify<Res>, NoResponse>(
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
    jsonFetch<Jsonify<Res>, NoResponse>(
      url,
      {
        ...initFactory(),
        body: JSON.stringify(data),
      },
      noResponse as NoResponse,
    );

export const urlWithQuery = <Query extends object>(url: string, params: Jsonify<Query>) => {
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
export const deleteRequest = bodilessRequest(createInitForDelete, false);
export const responselessDeleteRequest = bodilessRequest(createInitForDelete, true);
