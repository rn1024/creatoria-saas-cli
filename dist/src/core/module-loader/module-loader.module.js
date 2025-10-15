"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleLoaderModule = void 0;
const common_1 = require("@nestjs/common");
const module_loader_service_1 = require("./module-loader.service");
const config_module_1 = require("../../config/config.module");
let ModuleLoaderModule = class ModuleLoaderModule {
};
exports.ModuleLoaderModule = ModuleLoaderModule;
exports.ModuleLoaderModule = ModuleLoaderModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_module_1.ConfigModule],
        providers: [module_loader_service_1.ModuleLoaderService],
        exports: [module_loader_service_1.ModuleLoaderService],
    })
], ModuleLoaderModule);
//# sourceMappingURL=module-loader.module.js.map