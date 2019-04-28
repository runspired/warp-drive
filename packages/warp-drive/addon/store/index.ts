import RequestManager, { QueryRequest, RequestResponse } from 'warp-drive/query';
import lazyProp from 'ember-private-state/lazy-prop';
import { Cache, Operation } from 'warp-drive/cache/ts-interfaces';
import DefaultCache from 'warp-drive/cache';

// TODO not this
function operationsFromResult(result: RequestResponse) {
  return [result as Operation];
}

export default class Store {
  constructor(
    public requestManager: InstanceType<typeof RequestManager>,
    private _parentCache?: Cache
  ) {}

  @lazyProp
  get cache(): Cache {
    return new DefaultCache(this._parentCache);
  }

  query(query: QueryRequest): Promise<RequestResponse> {
    query.cache = this.cache;

    return this.requestManager.request(query).then((result: RequestResponse) => {
      const operations = operationsFromResult(result);

      for (let i = 0; i < operations.length; i++) {
        this.cache.update(operations[i]);
      }
      // TODO convert this to a UIDocument;
      return result;
    });
  }

  querySync(query: unknown) {
    let result = this.cache.query(query);
    // TODO extract into UIRecords;
    return result;
  }

  @lazyProp
  get log(): Operation[] {
    return [];
  }

  update(operation: Operation) {
    this.log.push(operation);
    this.cache.update(operation);
  }

  fork() {
    return new Store(this.requestManager, this.cache);
  }

  merge() {
    this.cache.merge();
  }
}
