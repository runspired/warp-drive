import Model from './model';
import { PARENT_COPY, EDITING_COPY, EDITABLE, SCHEMA } from './symbols';
import Ember from 'ember';

const {
  set: emberSet
  } = Ember;

function EditableModel(parent) {
  this[EDITING_COPY] = null;
  this[PARENT_COPY] = parent;
}
EditableModel.prototype = new Model();

EditableModel.prototype.set = function set(path, value) {
  if (this[PARENT_COPY]) {
    return emberSet(this, path, value);
  } else if (!this[EDITING_COPY]) {
    throw new Error('You must checkout a copy for editing before you can mutate.');
  } else {
    return emberSet(this[EDITING_COPY], path, value);
  }
};

EditableModel.prototype.checkoutForEditing = function checkoutForEditing() {
  if (this[PARENT_COPY]) {
    return this;
  }

  let schema = this.__schema;

  if (!this[EDITING_COPY]) {
    this[EDITING_COPY] = schema.cloneRecord(this);
  }

  return this[EDITING_COPY];
};

EditableModel.prototype.save = function save() {
  let { recordStore } = this.__schema;

  return recordStore.saveRecord(this[PARENT_COPY] || this);
};

EditableModel.prototype.del = function del() {
  let { recordStore } = this.__schema;

  return recordStore.deleteRecord(this[PARENT_COPY] || this);
};

EditableModel.prototype.discard = function discard() {
  this[PARENT_COPY][EDITING_COPY] = null;
  this[PARENT_COPY] = null;
};

EditableModel.prototype.__isEditable = true;

export default EditableModel;
