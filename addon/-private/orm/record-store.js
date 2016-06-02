import { EDITABLE, Schema } from './schema';

export default class RecordStore {

  constructor(owner) {
    this.owner = owner;
    this.schemas = new Map();
    this.records = new Map();
  }

  _lookup(path) {
    return this.owner.lookup(path);
  }

  _lookupFactory(path) {
    return this.owner._lookupFactory(path);
  }

  schemaFor(modelName) {
    let schema = this.schemas.get(modelName);

    if (!schema) {
      let shape = this._lookupFactory(`model:${modelName}`);

      schema = new Schema(shape, { modelName, editable: shape[EDITABLE] });

      this.schemas.set(modelName, schema);
      this.records.set(modelName, new Map());
    }

    return schema;
  }

  pushRecord(modelName, data) {
    let schema = this.schemaFor(modelName);
    let record = this.records.get(modelName).get(data.id);

    if (record) {
      schema.updateRecord(record, data);
    } else {
      record = schema.generateRecord(data);
      this.records.get(modelName).set(record.id, record);
    }

    return record;
  }

}
