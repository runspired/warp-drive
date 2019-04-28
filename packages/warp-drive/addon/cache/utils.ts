import {
  Operation,
  DocumentOperation,
  RecordOperation,
  RelationshipOperation,
} from './ts-interfaces';

export function isDocumentOperation(operation: Operation): operation is DocumentOperation {
  return (
    operation.op === 'replaceDocument' ||
    operation.op === 'addDocument' ||
    operation.op === 'removeDocument' ||
    operation.op === 'replaceAttribute'
  );
}

export function isRecordOperation(operation: Operation): operation is RecordOperation {
  return (
    operation.op === 'patchRecord' ||
    operation.op === 'replaceRecord' ||
    operation.op === 'addRecord' ||
    operation.op === 'removeRecord'
  );
}

export function isRelationshipOperation(operation: Operation): operation is RelationshipOperation {
  return (
    operation.op === 'replaceRelatedRecord' ||
    operation.op === 'replaceRelatedCollection' ||
    operation.op === 'addToRelatedCollection' ||
    operation.op === 'removeFromRelatedCollection'
  );
}
