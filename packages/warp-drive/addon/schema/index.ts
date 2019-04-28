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

An Interpreter is responsible for converting cache data
 into UI objects.

The Interpreter has access to a user-land service with hooks.
The Interpreter has access to user-land defined schemas.

Schemas may have:

- attributes
- relationships
- type
- defaultValues
- aliases
- transforms for attributes

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
