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
          isNullable: boolean
          isUnique: boolean
          default?: string | null
          isAutoIncrement?: boolean
          isUuid?: boolean
          isId?: boolean
          isVectorEmbed?: boolean
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
