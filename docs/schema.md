# dynamo-prisma schema:

example json file: [JSON DEMO](../demo.json)

```yaml
Schema:
  schema:
    - schemaName: string
      fields:
        - fieldName: string
          type: string
          description: string
          maxLength?: number | null
          nullable: boolean
          unique: boolean
          default?: string | null
          autoincrement?: boolean
          uuid?: boolean
          isId?: boolean
          vectorEmbed?: boolean
          embeddingAlgo?: string
          isForeignKey?: boolean
          isList?: boolean
      description: string
  dataSource:
    name: string
    provider: DataSourceProvider
    url:
      url: string
      fromEnv: DataSourceURLEnv
  enum:
    - name: string
      values: [string]
  generator:
    generatorName: string
    provider: string
    output: string
    binaryTargets: [string]
```
