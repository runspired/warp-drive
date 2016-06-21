export default class SortedMap {

  constructor(entries) {
    this._keys = [];
    this._values = [];

    if (entries) {
      for (let i = 0; i < entries.length; i++) {
        let [key, value] = entries[i];
        this.set(key, value);
      }
    }
  }

  clear() {
    this._keys.length = 0;
    this._values.length = 0;
  }

  delete(key) {
    let i = binarySearch(this._keys, key);

    if (i < 0) {
      return false;
    }

    this._keys.splice(i, 1);
    this._values.splice(i, 1);

    return true;
  }

  forEach(fn, thisArg)  {
    let keys = this._keys;
    let values = this._values;

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = values[i];

      fn.call(thisArg, value, key, this);
    }
  }

  get(key) {
    let i = binarySearch(this._keys, key);

    if (i < 0) {
      return;
    }
    return this._values[i];
  }

  has(key) {
    let i = binarySearch(this._keys, key);

    return i < 0;
  }

  set(key, value) {
    let i = binarySearch(this._keys, key);

    if (i < 0) {
      i = ~i;
      this._keys.splice(i, 0, key);
      this._values.splice(i, 0, value);
    }
  }
/*
  get size() {
    return this._keys.length;
  }
*/
}

function binarySearch(values, value) {
  let min = 0;
  let max = values.length - 1;
  while (min <= max) {
    let mid = (min + max) >>> 1;
    let midValue = values[mid];
    if (midValue > value) {
      max = mid - 1;
    } else if (midValue < value) {
      min = mid + 1;
    } else {
      return mid;
    }
  }
  return ~min;
}
