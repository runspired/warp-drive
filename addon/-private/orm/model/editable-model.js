import Model from './model';
import { PARENT_COPY, EDITING_COPY, EDITABLE, SCHEMA } from './symbols';
import Ember from 'ember';

const {
  set
  } = Ember;

export default class EditableModel extends Model {

  constructor(schema, parent) {
    super(schema);
    this[EDITABLE] = true;
    this[EDITING_COPY] = null;
    this[PARENT_COPY] = parent;
  }

  set(path, value) {
    if (this[PARENT_COPY]) {
      return set(this, path, value);
    } else if (!this[EDITING_COPY]) {
      throw new Error('You must checkout a copy for editing before you can mutate.');
    } else {
      return set(this[EDITING_COPY], path, value);
    }
  }

  checkoutForEditing() {
    if (this[PARENT_COPY]) {
      return this;
    }

    let schema = this[SCHEMA];

    if (!this[EDITING_COPY]) {
      this[EDITING_COPY] = schema.cloneRecord(this);
    }

    return this[EDITING_COPY];
  }

  save() {
    let { recordStore } = this[SCHEMA];

    return recordStore.saveRecord(this[PARENT_COPY] || this);
  }

  del() {
    let { recordStore } = this[SCHEMA];

    return recordStore.deleteRecord(this[PARENT_COPY] || this);
  }

  discard() {
    this[PARENT_COPY][EDITING_COPY] = null;
    this[PARENT_COPY] = null;
  }

}
