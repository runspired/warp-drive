export { default } from 'ember-orm/services/orm';

class RecordArray extends Array {

  constructor(...args) {
    super(...args);
  }

  fetch() {
    for (var i = 0; i < this.length; i++) {
      this[i] = typeof this[i] === 'number' ? this.namespace.findReference(this[i]) : this[i];

      // self clean
      if (!this[i] || this[i].__deleted) {
        this.splice(i, 1);
        i -=1;
      }
    }

    return this;
  }

  info() {
    return this.map(function(item) {
      return {
        id: item.id ? item.id : item,
        type: pluralize(this.type)
      };
    });
  }

}

RecordArray.prototype.relationship = null;
RecordArray.prototype.namespace = null;

window.RecordArray = RecordArray;
