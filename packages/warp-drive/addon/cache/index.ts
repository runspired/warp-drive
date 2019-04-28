import {
  Operation,
  RecordIdentifier,
  DocumentOperation,
  Document,
  RecordOperation,
  RelationshipOperation,
  DocumentIdentifier,
  Record,
  Cache,
} from './ts-interfaces';
import { DEBUG } from '@glimmer/env';
import lazyProp from 'ember-private-state/lazy-prop';
import { DebugProxy, isPrivate } from 'ember-private-state/debug';
import { isDocumentOperation, isRecordOperation, isRelationshipOperation } from './utils';

/*
  I think we just want a two level cache
  because not only does forking introduce
  problems with record ownership but also
  problems with "discard" or queried data.

  Forks make discarding changes cheap and easy,
  but they make discarding queried data
  very difficult.

  Consider the case of an autocomplete
  or stock streaming app whose data should
  be discarded on navigation or after
  a short time period. In this case, following
  a "requests up, changes down" flow every
  cache in the line updates with the query
  response. Discarding our fork has no
  effect on memory management because the
  final fork is merely reflecting information
  that is inside all of the parent forks
  as well.

  If however we flip this on its head and
  only sync queries flow through parent
  forks, then parent forks will fail
  to receive updates we may want. Then
  a manual merge would be required. This
  may not be a bad thing.

  ===>==>=Query-Pipe==>==>M=>M=>M=>R
  ==<==<==<===<====<===<==M<=M<=M<==
   | | | |/
   | | | C
   | | |/
   | | C
   | |/
   | C
   |/
   C

   * sync queries flow up cache tree
   * async queries go to RequestManager
   * merge sends changes up to parent cache

   Middleware is given the requesting cache
   to be able to peek
*/

class DefaultCache implements Cache {
  constructor(private _parentCache?: Cache) {}

  @isPrivate
  @lazyProp
  private get recordCache() {
    return new WeakMap<RecordIdentifier, Record>();
  }
  private get documentCache() {
    return new WeakMap<DocumentIdentifier, Document>();
  }

  @isPrivate
  @lazyProp
  private get graph() {
    return new Graph(this);
  }

  @lazyProp
  get log(): Operation[] {
    return [];
  }

  update(operation: DocumentOperation | RecordOperation | RelationshipOperation) {
    if (isDocumentOperation(operation)) {
      this.updateDocument(operation);
    } else if (isRecordOperation(operation)) {
      this.updateRecord(operation);
    } else if (isRelationshipOperation(operation)) {
      this.graph.update(operation);
    } else {
      fail(operation);
    }
    // only push operations that we handled
    this.log.push(operation);
  }

  query() {}

  @isPrivate
  updateDocument(operation: DocumentOperation) {
    switch (operation.op) {
      case 'addDocument':
        this.documentCache.set(operation.target, operation.value);
        break;
      case 'replaceDocument':
        if (operation.value !== null) {
          this.documentCache.set(operation.target, operation.value);
          break;
        }
        this.documentCache.delete(operation.target);
        break;
      case 'removeDocument':
        this.documentCache.delete(operation.target);
        break;
    }
  }

  @isPrivate
  updateRecord(operation: RecordOperation) {
    switch (operation.op) {
      case 'addRecord':
        this.recordCache;
    }
  }

  merge() {
    if (this._parentCache === undefined) {
      throw new Error(`Cannot merge this store as it is not a fork of another store`);
    }

    let log = this.log.slice();
    this.log.length = 0;

    for (let i = 0; i < log.length; i++) {
      this._parentCache.update(log[i]);
    }
  }
}

function fail(operation: Operation): never {
  throw new Error(`Unable to perform Operation: ${operation.op}`);
}

export default (DEBUG ? DebugProxy(DefaultCache) : DefaultCache);
