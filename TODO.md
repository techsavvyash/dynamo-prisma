# Dynamo-Prisma


## ToDo:

### 1. Fix Package Response
[Ticket](https://github.com/techsavvyash/dynamo-prisma/issues/13)

> Success Response
```json
{
    "error":false,
    "message":"Warnings if any",
    "data":"original schema with any modications made"
}
```

> Error Response
```json
{
    "error": true,
    "message" : "Error message",
}
```
### 2. Add support for Postgres types
[Ticket](https://github.com/techsavvyash/dynamo-prisma/issues/23)

### 3. Cover the following edge cases during `schema.prisma` generation.
1. No fields are unique
[Ticket](https://github.com/techsavvyash/dynamo-prisma/issues/5)
```json
{
    "schemaName": "test01",
    "fields": [
        {
            "fieldName": "Crop",
            "type": "VARCHAR",
            "description": "",
            "maxLength": "",
            "nullable": false,
            "unique": false,
            "vectorEmbed": false
        }
    ],
    "description": "Schema for seed treating materials data with details of each order"
}
```
  2. creation of a table with vector embeddings. extra columns to be added: cropAlgotithm, cropEmbedding
```json
{
    "schemaName": "test01",
    "fields": [
        {
            "fieldName": "Crop",
            "type": "VARCHAR",
            "description": "",
            "maxLength": "",
            "nullable": false,
            "unique": false,
            "vectorEmbed": true,
            "embeddingAlgorithm": "text-embedding-ada-002"
        }
    ],
    "description": "Schema for seed treating materials data with details of each order"
}
```
> Expected model:

```prisma
model test01 {
  Crop String
  CropAlgorithm  String
  CropEmbedding  Unsupported("vector(1536)")?
  @@unique([crop, abc])
}
```
The 1536 in this is according to the following mapping:
```json
{
  'text-embedding-ada-002': 1536,
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
}
```

4. Dash (`-`) in the `schemaName` and/or `fieldName`
Package can make modifications to the name, but the modification should be returned to a user, with a warning
[Ticket](https://github.com/techsavvyash/dynamo-prisma/issues/6)
```json
{
    "schemaName": "test01-value",
    "fields": [
        {
            "fieldName": "Crop-value",
            "type": "VARCHAR",
            "description": "",
            "maxLength": "",
            "nullable": false,
            "unique": false,
            "vectorEmbed": false
        }
    ],
    "description": "Schema for seed treating materials data with details of each order"
}
```
5. Whitespace in `schemaName` and/or `fieldName`
Package can make modifications to the name, but the modification should be returned to a user, with a warning
[Ticket](https://github.com/techsavvyash/dynamo-prisma/issues/3)

> Both have a white space
```json
{
    "schemaName": "test01 space",
    "fields": [
        {
            "fieldName": "Crop space",
            "type": "VARCHAR",
            "description": "",
            "maxLength": "",
            "nullable": false,
            "unique": false,
            "vectorEmbed": false
        }
    ],
    "description": "Schema for seed treating materials data with details of each order"
}
```
> schemaName has a white space
```json
{
    "schemaName": "test01 space",
    "fields": [
        {
            "fieldName": "Crop_space",
            "type": "VARCHAR",
            "description": "",
            "maxLength": "",
            "nullable": false,
            "unique": false,
            "vectorEmbed": false
        }
    ],
    "description": "Schema for seed treating materials data with details of each order"
}
```
> fieldName has a white space
```json
{
    "schemaName": "test01_space",
    "fields": [
        {
            "fieldName": "Crop space",
            "type": "VARCHAR",
            "description": "",
            "maxLength": "",
            "nullable": false,
            "unique": false,
            "vectorEmbed": false
        }
    ],
    "description": "Schema for seed treating materials data with details of each order"
}
```