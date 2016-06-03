class RecordArray extends Array {

  constructor(meta, ...args) {
    super(...args);

    this.meta = meta;
  }

}

export default RecordArray;
