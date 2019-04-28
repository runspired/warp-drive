/*

UIRecord
UIDocument

RecordIdentifier
Record
Document

Cache
Graph

Store

RequestManager
  Middleware

Request
  Query
    
  Mutation
    Operation

Where does Schema go?
  - Cache honestly doesn't need it
  - Mostly a UI Concern, Sometimes a Normalization / Serialization Concern

M3 {
  computeAttributeReference()
  computeNestedModel()
  getDefaultValue()
  transformValue()
  includesModel()
  computeBaseModelName()
  isAttributeIncluded()
  getAttributeAlias()
  computeAttributes()
  setAttribute()
  isAttributeResolved()
  _modelSchema(modelName) (schema.models[modelName])
  _modelSchemaProperty(modelName, property)
}










*/
