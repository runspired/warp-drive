function RecordArray(meta, ...args) {
  var arr = [];

  arr.push.apply(arr, ...args);
  arr.__proto__ = RecordArray.prototype;
  arr.meta = meta;

  return arr;
}
RecordArray.prototype = new Array();

export default RecordArray;
