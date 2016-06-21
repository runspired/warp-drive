import {
  SMALL_ARRAY_LENGTH,
  LARGE_ARRAY_LENGTH
} from './fast-array';

export const UNDEFINED_KEY = Object.create(null);

export default class FastMap {

  constructor(entries, length = SMALL_ARRAY_LENGTH) {
    let len = this.length = entries ? entries.length : 0;
    this._length = this.length >= length ? this.length * 2 : length;
    this._keys = new Array(this._length);
    this._values = new Array(this._length);
    this.__undefined = new Array();

    if (entries) {
      for (let i = 0; i < len; i++) {
        this._keys[i] = entries[i][0];
        this._values[i] = entries[i][1];
      }
    }
  }

  forEach(cb) {
    let { length } = this;

    for (let i = 0; i < length; i++) {
      let key = this._keys[i];

      // skip undefined
      if (key !== UNDEFINED_KEY) {
        cb(this._values[i], key);
      }
    }

    return this;
  }

  get(key) {
    let index = this._keys.indexOf(key);

    if (index === -1) {
      return undefined;
    }

    return this._values[index];
  }

  set(key, value) {
    let index;

    // reuse cells
    if (this.__undefined.length) {
      index = this.__undefined.pop();

      this._keys[index] = key;
      this._values[index] = value;
      return this;
    }

    // reuse existing index
    index = this._keys.indexOf(key);
    if (index !== -1) {
      this._values[index] = value;
      return this;
    }

    // add new index
    index = this.length++;
    if (index === this._length) {
      this._length *= 2;
      this._keys.length = this._length;
      this._values.length = this._length;
    }

    this._keys[index] = key;
    this._values[index] = value;
    return this;
  }

  delete(key) {
    let index = this._keys.indexOf(key);

    if (index === -1) {
      return false;
    }

    this._keys[index] = UNDEFINED_KEY;
    this._values[index] = UNDEFINED_KEY;
    this.__undefined.push(index);

    return true;
  }

}
