"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentFormat = exports.SecurityType = exports.SchemaType = exports.ParameterLocation = exports.HttpMethod = void 0;
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "GET";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["PATCH"] = "PATCH";
    HttpMethod["DELETE"] = "DELETE";
    HttpMethod["HEAD"] = "HEAD";
    HttpMethod["OPTIONS"] = "OPTIONS";
})(HttpMethod || (exports.HttpMethod = HttpMethod = {}));
var ParameterLocation;
(function (ParameterLocation) {
    ParameterLocation["QUERY"] = "query";
    ParameterLocation["HEADER"] = "header";
    ParameterLocation["PATH"] = "path";
    ParameterLocation["COOKIE"] = "cookie";
})(ParameterLocation || (exports.ParameterLocation = ParameterLocation = {}));
var SchemaType;
(function (SchemaType) {
    SchemaType["NULL"] = "null";
    SchemaType["BOOLEAN"] = "boolean";
    SchemaType["OBJECT"] = "object";
    SchemaType["ARRAY"] = "array";
    SchemaType["NUMBER"] = "number";
    SchemaType["STRING"] = "string";
    SchemaType["INTEGER"] = "integer";
})(SchemaType || (exports.SchemaType = SchemaType = {}));
var SecurityType;
(function (SecurityType) {
    SecurityType["API_KEY"] = "apiKey";
    SecurityType["HTTP"] = "http";
    SecurityType["OAUTH2"] = "oauth2";
    SecurityType["OPENID_CONNECT"] = "openIdConnect";
})(SecurityType || (exports.SecurityType = SecurityType = {}));
var DocumentFormat;
(function (DocumentFormat) {
    DocumentFormat["JSON"] = "json";
    DocumentFormat["YAML"] = "yaml";
    DocumentFormat["HTML"] = "html";
    DocumentFormat["MARKDOWN"] = "markdown";
    DocumentFormat["PDF"] = "pdf";
    DocumentFormat["POSTMAN"] = "postman";
    DocumentFormat["OPENAPI"] = "openapi";
})(DocumentFormat || (exports.DocumentFormat = DocumentFormat = {}));
//# sourceMappingURL=doc.interface.js.map