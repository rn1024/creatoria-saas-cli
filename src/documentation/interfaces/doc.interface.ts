/**
 * 文档接口定义
 */

export interface IDocumentation {
  title: string;
  version: string;
  description: string;
  generated: Date;
}

export interface IApiDocumentation extends IDocumentation {
  basePath: string;
  endpoints: IApiEndpoint[];
  models: Map<string, IApiModel>;
  tags: string[];
  servers?: IApiServer[];
}

export interface IApiEndpoint {
  method: HttpMethod;
  path: string;
  operationId: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: IApiParameter[];
  requestBody?: IApiRequestBody;
  responses?: Map<number, IApiResponse>;
  security?: IApiSecurity[];
  deprecated?: boolean;
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

export interface IApiParameter {
  name: string;
  in: ParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  schema?: IApiSchema;
  example?: any;
  examples?: Map<string, IApiExample>;
}

export enum ParameterLocation {
  QUERY = 'query',
  HEADER = 'header',
  PATH = 'path',
  COOKIE = 'cookie',
}

export interface IApiRequestBody {
  description?: string;
  required?: boolean;
  content: Map<string, IApiMediaType>;
}

export interface IApiResponse {
  description: string;
  headers?: Map<string, IApiHeader>;
  content?: Map<string, IApiMediaType>;
  links?: Map<string, IApiLink>;
}

export interface IApiMediaType {
  schema?: IApiSchema;
  example?: any;
  examples?: Map<string, IApiExample>;
  encoding?: Map<string, IApiEncoding>;
}

export interface IApiSchema {
  type?: SchemaType;
  format?: string;
  title?: string;
  description?: string;
  default?: any;
  nullable?: boolean;
  discriminator?: IApiDiscriminator;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: IApiXml;
  externalDocs?: IApiExternalDocs;
  example?: any;
  deprecated?: boolean;
  
  // Type-specific properties
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
  
  // Composition
  allOf?: IApiSchema[];
  oneOf?: IApiSchema[];
  anyOf?: IApiSchema[];
  not?: IApiSchema;
  
  // Object properties
  properties?: Map<string, IApiSchema>;
  additionalProperties?: boolean | IApiSchema;
  
  // Array properties
  items?: IApiSchema;
  
  // Reference
  $ref?: string;
}

export enum SchemaType {
  NULL = 'null',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  NUMBER = 'number',
  STRING = 'string',
  INTEGER = 'integer',
}

export interface IApiExample {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

export interface IApiHeader {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  schema?: IApiSchema;
  example?: any;
  examples?: Map<string, IApiExample>;
}

export interface IApiLink {
  operationRef?: string;
  operationId?: string;
  parameters?: Map<string, any>;
  requestBody?: any;
  description?: string;
  server?: IApiServer;
}

export interface IApiSecurity {
  type: SecurityType;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: IApiOAuthFlows;
  openIdConnectUrl?: string;
}

export enum SecurityType {
  API_KEY = 'apiKey',
  HTTP = 'http',
  OAUTH2 = 'oauth2',
  OPENID_CONNECT = 'openIdConnect',
}

export interface IApiOAuthFlows {
  implicit?: IApiOAuthFlow;
  password?: IApiOAuthFlow;
  clientCredentials?: IApiOAuthFlow;
  authorizationCode?: IApiOAuthFlow;
}

export interface IApiOAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Map<string, string>;
}

export interface IApiDiscriminator {
  propertyName: string;
  mapping?: Map<string, string>;
}

export interface IApiXml {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

export interface IApiExternalDocs {
  description?: string;
  url: string;
}

export interface IApiServer {
  url: string;
  description?: string;
  variables?: Map<string, IApiServerVariable>;
}

export interface IApiServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

export interface IApiModel {
  name: string;
  description?: string;
  properties: Map<string, IApiSchema>;
  required?: string[];
  example?: any;
}

export interface IApiTag {
  name: string;
  description?: string;
  externalDocs?: IApiExternalDocs;
}

export interface IApiInfo {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: IApiContact;
  license?: IApiLicense;
  version: string;
}

export interface IApiContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface IApiLicense {
  name: string;
  url?: string;
}

export interface IApiEncoding {
  contentType?: string;
  headers?: Map<string, IApiHeader>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

/**
 * 文档生成器接口
 */
export interface IDocumentGenerator {
  generate(): Promise<IDocumentation>;
  export(format: DocumentFormat): Promise<string>;
}

export enum DocumentFormat {
  JSON = 'json',
  YAML = 'yaml',
  HTML = 'html',
  MARKDOWN = 'markdown',
  PDF = 'pdf',
  POSTMAN = 'postman',
  OPENAPI = 'openapi',
}