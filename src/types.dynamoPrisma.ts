import {
  DataSourceProvider,
  DataSourceURLEnv,
  Enum,
} from "prisma-schema-dsl-types";

export interface Field {
  fieldName: string;
  type: string;
  description: string;
  maxLength?: number | null;
  nullable: boolean;
  unique: boolean;
  default?: string | null;
  autoincrement?: boolean;
  uuid?: boolean;

  isId?: boolean;
  vectorEmbed?: boolean;
  embeddingAlgo?: string;
  isForeignKey?: boolean;
  isList?: boolean;
}

export interface Schema {
  schema: [{ schemaName: string; fields: Field[]; description: string }];
  dataSource?: {
    name: string;
    provider: DataSourceProvider;
    url: {
      url: string;
      fromEnv: DataSourceURLEnv;
      // fromEnv: DataSourceURLEnv;
    };
  };
  enum?: Enum[];
  generator?: {
    generatorName: string;
    provider: string;
    output: string;
    binaryTargets: string[];
  };
}
