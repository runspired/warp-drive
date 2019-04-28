/*
  A few design decisions that went into this:

  - A Cache can give you errors, but you cannot give a cache errors
  - A Cache can give you links, meta, but you cannot give them to a cache
  - These things enter the cache as part of a Record or Document Operation
*/
export interface Identifier {
  lid: string;
}
export interface RecordIdentifier extends Identifier {
  id: string | null;
  type: string;
}

export interface DocumentIdentifier extends Identifier {
  url: string;
  expires?: string;
  type: 'Record' | 'collection' | 'related-Record' | 'related-collection';
}

export interface Operation {
  op: string;
  target: Identifier;
  property?: string;
  value?: unknown;
}

export interface Document {
  links?: object;
  data?: RecordIdentifier | RecordIdentifier[];
  included?: RecordIdentifier[];
  errors?: any[];
  meta?: object;
  // operations?: object[];
}

export interface Record extends RecordIdentifier {
  attributes?: object;
  relationships?: object;
  errors?: any[];
  links?: object;
  meta?: object;
}

export interface Cache {
  update(operation: Operation): void;
  query(query: any): unknown;
  merge(): void;
}

// Document Operations
export interface AddDocumentOperation extends Operation {
  target: DocumentIdentifier;
  op: 'addDocument';
  value: Document;
}
export interface ReplaceDocumentOperation extends Operation {
  target: DocumentIdentifier;
  op: 'replaceDocument';
  value: Document | null;
}
export interface RemoveDocumentOperation extends Operation {
  target: DocumentIdentifier;
  op: 'removeDocument';
}
export type DocumentOperation =
  | AddDocumentOperation
  | ReplaceDocumentOperation
  | RemoveDocumentOperation;

// Record Operations

export interface AddRecordOperation extends Operation {
  target: RecordIdentifier;
  op: 'addRecord';
}
export interface RemoveRecordOperation extends Operation {
  target: RecordIdentifier;
  op: 'removeRecord';
}
export interface PatchRecordOperation extends Operation {
  target: RecordIdentifier;
  op: 'patchRecord';
}
export interface ReplaceRecordOperation extends Operation {
  target: RecordIdentifier;
  op: 'replaceRecord';
}
export interface ReplaceAttributeOperation extends Operation {
  target: RecordIdentifier;
  op: 'replaceAttribute';
  property: string;
}
export type RecordOperation =
  | AddRecordOperation
  | RemoveRecordOperation
  | PatchRecordOperation
  | ReplaceRecordOperation
  | ReplaceAttributeOperation;

// Graph Operations

export interface AddToRelatedCollectionOperation extends Operation {
  target: RecordIdentifier;
  op: 'addToRelatedCollection';
  property: string;
  value: RecordIdentifier;
}
export interface RemoveFromRelatedCollectionOperation extends Operation {
  target: RecordIdentifier;
  op: 'removeFromRelatedCollection';
  property: string;
  value: RecordIdentifier;
}
export type PatchCollectionRelationshipOperation =
  | AddToRelatedCollectionOperation
  | RemoveFromRelatedCollectionOperation;

export interface ReplaceRelatedCollectionOperation extends Operation {
  target: RecordIdentifier;
  op: 'replaceRelatedCollection';
  property: string;
  value: RecordIdentifier[];
}
export interface ReplaceRelatedRecordOperation extends Operation {
  target: RecordIdentifier;
  op: 'replaceRelatedRecord';
  property: string;
  value: RecordIdentifier;
}
export type ReplaceRelationshipOperation =
  | ReplaceRelatedCollectionOperation
  | ReplaceRelatedRecordOperation;

export type RelationshipOperation =
  | PatchCollectionRelationshipOperation
  | ReplaceRelationshipOperation;
