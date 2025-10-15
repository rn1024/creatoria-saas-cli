"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorSeverity = exports.ErrorCategory = void 0;
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["SYSTEM"] = "SYSTEM";
    ErrorCategory["VALIDATION"] = "VALIDATION";
    ErrorCategory["BUSINESS"] = "BUSINESS";
    ErrorCategory["PERMISSION"] = "PERMISSION";
    ErrorCategory["NETWORK"] = "NETWORK";
    ErrorCategory["DEPENDENCY"] = "DEPENDENCY";
    ErrorCategory["FILESYSTEM"] = "FILESYSTEM";
    ErrorCategory["CONFIGURATION"] = "CONFIGURATION";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["FATAL"] = "FATAL";
    ErrorSeverity["ERROR"] = "ERROR";
    ErrorSeverity["WARNING"] = "WARNING";
    ErrorSeverity["INFO"] = "INFO";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
//# sourceMappingURL=error.types.js.map