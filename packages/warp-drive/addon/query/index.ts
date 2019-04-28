import { Operation, Document, Cache } from 'warp-drive/cache/ts-interfaces';
import { DEBUG } from '@glimmer/env';
import lazyProp from 'ember-private-state/lazy-prop';
import { isPrivate, DebugProxy } from 'ember-private-state/debug';

type nextFn = (request: Request) => Promise<RequestResponse>;

export interface RequestResponse {
  data?: Document;
  error: Error;
}

export interface RequestMiddleware {
  request(request: Request, next: nextFn): Promise<RequestResponse>;
}

export interface MutationRequest {
  type: 'mutation';
  ops: Operation[];
  cache: Cache;
}

export interface QueryRequest {
  type: 'query';
  cache: Cache;
}
export type Request = MutationRequest | QueryRequest;

async function perform(
  wares: Readonly<RequestMiddleware[]>,
  request: Request,
  i: number = 0
): Promise<RequestResponse> {
  if (i === wares.length) {
    throw new Error(`No middleware was able to handle this request ${request.type}`);
  }

  function next(r: Request): Promise<RequestResponse> {
    return perform(wares, r, i + 1);
  }

  return wares[i].request(request, next);
}

const WARES_MAP = new WeakMap<RequestManager, RequestMiddleware[]>();

function waresFor(manager: RequestManager): RequestMiddleware[] {
  let map = WARES_MAP.get(manager);
  if (map === undefined) {
    map = [];
    WARES_MAP.set(manager, map);
  }
  return map;
}

export interface RequestManager {
  use(middleware: RequestMiddleware): void;
  request(request: Request): Promise<RequestResponse>;
}

class _RequestManager implements RequestManager {
  use(middleware: RequestMiddleware): void {
    let map = waresFor(this);
    map.push(middleware);
  }

  @lazyProp
  @isPrivate
  private get _wares(): Readonly<RequestMiddleware[]> {
    let map = waresFor(this);
    return DEBUG ? Object.freeze(map) : map;
  }

  async request(request: Request) {
    return await perform(this._wares, request);
  }
}

export default (DEBUG ? (DebugProxy(_RequestManager) as RequestManager) : _RequestManager);
