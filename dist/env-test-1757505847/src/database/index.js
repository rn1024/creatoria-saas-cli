"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictDataStatusEnum = exports.DictStatusEnum = void 0;
__exportStar(require("./entities/base.entity"), exports);
__exportStar(require("./entities/user.entity"), exports);
__exportStar(require("./entities/role.entity"), exports);
__exportStar(require("./entities/menu.entity"), exports);
__exportStar(require("./entities/dept.entity"), exports);
__exportStar(require("./entities/area.entity"), exports);
__exportStar(require("./entities/audit-log.entity"), exports);
__exportStar(require("./entities/operation-log.entity"), exports);
__exportStar(require("./entities/login-log.entity"), exports);
__exportStar(require("./entities/notice.entity"), exports);
var DictStatusEnum;
(function (DictStatusEnum) {
    DictStatusEnum[DictStatusEnum["ENABLED"] = 0] = "ENABLED";
    DictStatusEnum[DictStatusEnum["DISABLED"] = 1] = "DISABLED";
})(DictStatusEnum || (exports.DictStatusEnum = DictStatusEnum = {}));
var DictDataStatusEnum;
(function (DictDataStatusEnum) {
    DictDataStatusEnum[DictDataStatusEnum["ENABLED"] = 0] = "ENABLED";
    DictDataStatusEnum[DictDataStatusEnum["DISABLED"] = 1] = "DISABLED";
})(DictDataStatusEnum || (exports.DictDataStatusEnum = DictDataStatusEnum = {}));
//# sourceMappingURL=index.js.map