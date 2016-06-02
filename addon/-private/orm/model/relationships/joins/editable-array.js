class EditableArray extends Array {

  constructor(items) {
    super(...items);

    this._isEditable = true;
    this.isDirty = false;
    this.added = [];
    this.removed = [];
  }

  add(item) {
    if (this.indexOf(item) === -1) {
      this.push(item);
      this._updateDirtyState(item, true);
    }
  }

  remove(item) {
    let index = this.indexOf(item);

    if (index !== -1) {
      this.splice(index, 1);
      this._updateDirtyState(item, false);
    }
  }

  _updateDirtyState(item, added) {
    let index;

    if (added) {
      index = this.removed.indexOf(item);

      if (index === -1) {
        this.added.push(item);
      } else {
        this.removed.splice(index, 1);
      }
    } else {
      index = this.added.indexOf(item);

      if (index === -1) {
        this.removed.push(item);
      } else {
        this.added.splice(index, 1);
      }
    }

    this.isDirty = this.removed.length || this.added.length;
  }

}

export default EditableArray;
