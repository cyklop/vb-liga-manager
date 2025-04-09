"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/users/me/route";
exports.ids = ["app/api/users/me/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fusers%2Fme%2Froute&page=%2Fapi%2Fusers%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Fme%2Froute.ts&appDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fusers%2Fme%2Froute&page=%2Fapi%2Fusers%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Fme%2Froute.ts&appDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_schne1s_Documents_KI_PAGE_src_app_api_users_me_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/users/me/route.ts */ \"(rsc)/./src/app/api/users/me/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/users/me/route\",\n        pathname: \"/api/users/me\",\n        filename: \"route\",\n        bundlePath: \"app/api/users/me/route\"\n    },\n    resolvedPagePath: \"/Users/schne1s/Documents/KI_PAGE/src/app/api/users/me/route.ts\",\n    nextConfigOutput,\n    userland: _Users_schne1s_Documents_KI_PAGE_src_app_api_users_me_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/users/me/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ1c2VycyUyRm1lJTJGcm91dGUmcGFnZT0lMkZhcGklMkZ1c2VycyUyRm1lJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGdXNlcnMlMkZtZSUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnNjaG5lMXMlMkZEb2N1bWVudHMlMkZLSV9QQUdFJTJGc3JjJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnNjaG5lMXMlMkZEb2N1bWVudHMlMkZLSV9QQUdFJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNjO0FBQzNGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdm9sbGV5YmFsbC1saWdhLW1hbmFnZXIvP2EwMzgiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiL1VzZXJzL3NjaG5lMXMvRG9jdW1lbnRzL0tJX1BBR0Uvc3JjL2FwcC9hcGkvdXNlcnMvbWUvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3VzZXJzL21lL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvdXNlcnMvbWVcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3VzZXJzL21lL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL3NjaG5lMXMvRG9jdW1lbnRzL0tJX1BBR0Uvc3JjL2FwcC9hcGkvdXNlcnMvbWUvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL3VzZXJzL21lL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fusers%2Fme%2Froute&page=%2Fapi%2Fusers%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Fme%2Froute.ts&appDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\n// Erstelle eine einzige Instanz des Prisma Clients\nconst prismaClientSingleton = ()=>{\n    return new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    });\n};\n// Verwende die globale Variable, um die Instanz zu speichern\nconst prisma = globalThis.prisma ?? prismaClientSingleton();\n// In Entwicklungsumgebungen speichern wir die Instanz im globalen Objekt\nif (true) globalThis.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBNkM7QUFhN0MsbURBQW1EO0FBQ25ELE1BQU1DLHdCQUF3QjtJQUM1QixPQUFPLElBQUlELHdEQUFZQSxDQUFDO0lBR3hCO0FBQ0Y7QUFFQSw2REFBNkQ7QUFDdEQsTUFBTUUsU0FBU0MsV0FBV0QsTUFBTSxJQUFJRCx3QkFBdUI7QUFFbEUseUVBQXlFO0FBQ3pFLElBQUlHLElBQXlCLEVBQWNELFdBQVdELE1BQU0sR0FBR0E7QUFFL0QsaUVBQWVBLE1BQU1BLEVBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92b2xsZXliYWxsLWxpZ2EtbWFuYWdlci8uL2xpYi9wcmlzbWEudHM/OTgyMiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCdcblxuLy8gUHJpc21hQ2xpZW50IGlzIGF0dGFjaGVkIHRvIHRoZSBgZ2xvYmFsYCBvYmplY3QgaW4gZGV2ZWxvcG1lbnQgdG8gcHJldmVudFxuLy8gZXhoYXVzdGluZyB5b3VyIGRhdGFiYXNlIGNvbm5lY3Rpb24gbGltaXQuXG4vL1xuLy8gTGVhcm4gbW9yZTogaHR0cHM6Ly9wcmlzLmx5L2QvaGVscC9uZXh0LWpzLWJlc3QtcHJhY3RpY2VzXG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gYWxsb3cgZ2xvYmFsIGB2YXJgIGRlY2xhcmF0aW9uc1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdmFyXG4gIHZhciBwcmlzbWE6IFByaXNtYUNsaWVudCB8IHVuZGVmaW5lZFxufVxuXG4vLyBFcnN0ZWxsZSBlaW5lIGVpbnppZ2UgSW5zdGFueiBkZXMgUHJpc21hIENsaWVudHNcbmNvbnN0IHByaXNtYUNsaWVudFNpbmdsZXRvbiA9ICgpID0+IHtcbiAgcmV0dXJuIG5ldyBQcmlzbWFDbGllbnQoe1xuICAgIC8vIE9wdGlvbmFsOiBFbmFibGUgbG9nZ2luZyBpbiBkZXZlbG9wbWVudFxuICAgIC8vIGxvZzogWydxdWVyeScsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSxcbiAgfSlcbn1cblxuLy8gVmVyd2VuZGUgZGllIGdsb2JhbGUgVmFyaWFibGUsIHVtIGRpZSBJbnN0YW56IHp1IHNwZWljaGVyblxuZXhwb3J0IGNvbnN0IHByaXNtYSA9IGdsb2JhbFRoaXMucHJpc21hID8/IHByaXNtYUNsaWVudFNpbmdsZXRvbigpXG5cbi8vIEluIEVudHdpY2tsdW5nc3VtZ2VidW5nZW4gc3BlaWNoZXJuIHdpciBkaWUgSW5zdGFueiBpbSBnbG9iYWxlbiBPYmpla3RcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBnbG9iYWxUaGlzLnByaXNtYSA9IHByaXNtYVxuXG5leHBvcnQgZGVmYXVsdCBwcmlzbWFcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJwcmlzbWFDbGllbnRTaW5nbGV0b24iLCJwcmlzbWEiLCJnbG9iYWxUaGlzIiwicHJvY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/[...nextauth]/route.ts":
/*!*************************************************!*\
  !*** ./src/app/api/auth/[...nextauth]/route.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcrypt__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcrypt */ \"bcrypt\");\n/* harmony import */ var bcrypt__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bcrypt__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"Credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"text\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Bitte geben Sie E-Mail und Passwort ein\");\n                }\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.user.findUnique({\n                    where: {\n                        email: credentials.email\n                    },\n                    include: {\n                        teams: {\n                            select: {\n                                team: {\n                                    select: {\n                                        id: true,\n                                        name: true\n                                    }\n                                }\n                            }\n                        }\n                    }\n                });\n                if (!user) {\n                    throw new Error(\"Benutzer nicht gefunden\");\n                }\n                const isPasswordValid = await bcrypt__WEBPACK_IMPORTED_MODULE_2___default().compare(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error(\"Ung\\xfcltiges Passwort\");\n                }\n                // Extract the first team if available\n                const team = user.teams.length > 0 ? user.teams[0].team : null;\n                return {\n                    id: user.id.toString(),\n                    email: user.email,\n                    name: user.name,\n                    isAdmin: user.isAdmin,\n                    isSuperAdmin: user.isSuperAdmin,\n                    team: team\n                };\n            }\n        })\n    ],\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    callbacks: {\n        async jwt ({ token, user, trigger }) {\n            if (user) {\n                // Only update the token when a sign in happens\n                token.id = user.id;\n                token.email = user.email;\n                token.name = user.name;\n                token.isAdmin = user.isAdmin;\n                token.isSuperAdmin = user.isSuperAdmin;\n                token.team = user.team;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n                session.user.email = token.email;\n                session.user.name = token.name;\n                session.user.isAdmin = token.isAdmin;\n                session.user.isSuperAdmin = token.isSuperAdmin;\n                session.user.team = token.team;\n            }\n            return session;\n        }\n    },\n    session: {\n        strategy: \"jwt\"\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQWlDO0FBQ2lDO0FBQ3RDO0FBQ1U7QUFFL0IsTUFBTUksY0FBYztJQUN6QkMsV0FBVztRQUNUSiwyRUFBbUJBLENBQUM7WUFDbEJLLE1BQU07WUFDTkMsYUFBYTtnQkFDWEMsT0FBTztvQkFBRUMsT0FBTztvQkFBU0MsTUFBTTtnQkFBTztnQkFDdENDLFVBQVU7b0JBQUVGLE9BQU87b0JBQVlDLE1BQU07Z0JBQVc7WUFDbEQ7WUFDQSxNQUFNRSxXQUFVTCxXQUFXO2dCQUN6QixJQUFJLENBQUNBLGFBQWFDLFNBQVMsQ0FBQ0QsYUFBYUksVUFBVTtvQkFDakQsTUFBTSxJQUFJRSxNQUFNO2dCQUNsQjtnQkFFQSxNQUFNQyxPQUFPLE1BQU1YLCtDQUFNQSxDQUFDVyxJQUFJLENBQUNDLFVBQVUsQ0FBQztvQkFDeENDLE9BQU87d0JBQUVSLE9BQU9ELFlBQVlDLEtBQUs7b0JBQUM7b0JBQ2xDUyxTQUFTO3dCQUNQQyxPQUFPOzRCQUNMQyxRQUFRO2dDQUNOQyxNQUFNO29DQUNKRCxRQUFRO3dDQUNORSxJQUFJO3dDQUNKZixNQUFNO29DQUNSO2dDQUNGOzRCQUNGO3dCQUNGO29CQUNGO2dCQUNGO2dCQUVBLElBQUksQ0FBQ1EsTUFBTTtvQkFDVCxNQUFNLElBQUlELE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1TLGtCQUFrQixNQUFNcEIscURBQWMsQ0FDMUNLLFlBQVlJLFFBQVEsRUFDcEJHLEtBQUtILFFBQVE7Z0JBR2YsSUFBSSxDQUFDVyxpQkFBaUI7b0JBQ3BCLE1BQU0sSUFBSVQsTUFBTTtnQkFDbEI7Z0JBRUEsc0NBQXNDO2dCQUN0QyxNQUFNTyxPQUFPTixLQUFLSSxLQUFLLENBQUNNLE1BQU0sR0FBRyxJQUFJVixLQUFLSSxLQUFLLENBQUMsRUFBRSxDQUFDRSxJQUFJLEdBQUc7Z0JBRTFELE9BQU87b0JBQ0xDLElBQUlQLEtBQUtPLEVBQUUsQ0FBQ0ksUUFBUTtvQkFDcEJqQixPQUFPTSxLQUFLTixLQUFLO29CQUNqQkYsTUFBTVEsS0FBS1IsSUFBSTtvQkFDZm9CLFNBQVNaLEtBQUtZLE9BQU87b0JBQ3JCQyxjQUFjYixLQUFLYSxZQUFZO29CQUMvQlAsTUFBTUE7Z0JBQ1I7WUFDRjtRQUNGO0tBQ0Q7SUFDRFEsT0FBTztRQUNMQyxRQUFRO1FBQ1JDLE9BQU87SUFDVDtJQUNBQyxXQUFXO1FBQ1QsTUFBTUMsS0FBSSxFQUFFQyxLQUFLLEVBQUVuQixJQUFJLEVBQUVvQixPQUFPLEVBQUU7WUFDaEMsSUFBSXBCLE1BQU07Z0JBQ1IsK0NBQStDO2dCQUMvQ21CLE1BQU1aLEVBQUUsR0FBR1AsS0FBS08sRUFBRTtnQkFDbEJZLE1BQU16QixLQUFLLEdBQUdNLEtBQUtOLEtBQUs7Z0JBQ3hCeUIsTUFBTTNCLElBQUksR0FBR1EsS0FBS1IsSUFBSTtnQkFDdEIyQixNQUFNUCxPQUFPLEdBQUdaLEtBQUtZLE9BQU87Z0JBQzVCTyxNQUFNTixZQUFZLEdBQUdiLEtBQUthLFlBQVk7Z0JBQ3RDTSxNQUFNYixJQUFJLEdBQUdOLEtBQUtNLElBQUk7WUFDeEI7WUFDQSxPQUFPYTtRQUNUO1FBQ0EsTUFBTUUsU0FBUSxFQUFFQSxPQUFPLEVBQUVGLEtBQUssRUFBRTtZQUM5QixJQUFJRSxRQUFRckIsSUFBSSxFQUFFO2dCQUNoQnFCLFFBQVFyQixJQUFJLENBQUNPLEVBQUUsR0FBR1ksTUFBTVosRUFBRTtnQkFDMUJjLFFBQVFyQixJQUFJLENBQUNOLEtBQUssR0FBR3lCLE1BQU16QixLQUFLO2dCQUNoQzJCLFFBQVFyQixJQUFJLENBQUNSLElBQUksR0FBRzJCLE1BQU0zQixJQUFJO2dCQUM5QjZCLFFBQVFyQixJQUFJLENBQUNZLE9BQU8sR0FBR08sTUFBTVAsT0FBTztnQkFDcENTLFFBQVFyQixJQUFJLENBQUNhLFlBQVksR0FBR00sTUFBTU4sWUFBWTtnQkFDOUNRLFFBQVFyQixJQUFJLENBQUNNLElBQUksR0FBR2EsTUFBTWIsSUFBSTtZQUNoQztZQUNBLE9BQU9lO1FBQ1Q7SUFDRjtJQUNBQSxTQUFTO1FBQ1BDLFVBQVU7SUFDWjtBQUNGLEVBQUU7QUFFRixNQUFNQyxVQUFVckMsZ0RBQVFBLENBQUNJO0FBQ2tCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdm9sbGV5YmFsbC1saWdhLW1hbmFnZXIvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHM/MDA5OCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV4dEF1dGggZnJvbSBcIm5leHQtYXV0aFwiO1xuaW1wb3J0IENyZWRlbnRpYWxzUHJvdmlkZXIgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHNcIjtcbmltcG9ydCBiY3J5cHQgZnJvbSBcImJjcnlwdFwiO1xuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xuXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnMgPSB7XG4gIHByb3ZpZGVyczogW1xuICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgbmFtZTogXCJDcmVkZW50aWFsc1wiLFxuICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgZW1haWw6IHsgbGFiZWw6IFwiRW1haWxcIiwgdHlwZTogXCJ0ZXh0XCIgfSxcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6IFwiUGFzc3dvcmRcIiwgdHlwZTogXCJwYXNzd29yZFwiIH0sXG4gICAgICB9LFxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCaXR0ZSBnZWJlbiBTaWUgRS1NYWlsIHVuZCBQYXNzd29ydCBlaW5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcHJpc21hLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgICAgICAgd2hlcmU6IHsgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsIH0sXG4gICAgICAgICAgaW5jbHVkZToge1xuICAgICAgICAgICAgdGVhbXM6IHtcbiAgICAgICAgICAgICAgc2VsZWN0OiB7XG4gICAgICAgICAgICAgICAgdGVhbToge1xuICAgICAgICAgICAgICAgICAgc2VsZWN0OiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0cnVlXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCZW51dHplciBuaWNodCBnZWZ1bmRlblwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzUGFzc3dvcmRWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKFxuICAgICAgICAgIGNyZWRlbnRpYWxzLnBhc3N3b3JkLFxuICAgICAgICAgIHVzZXIucGFzc3dvcmRcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoIWlzUGFzc3dvcmRWYWxpZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZ8O8bHRpZ2VzIFBhc3N3b3J0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXh0cmFjdCB0aGUgZmlyc3QgdGVhbSBpZiBhdmFpbGFibGVcbiAgICAgICAgY29uc3QgdGVhbSA9IHVzZXIudGVhbXMubGVuZ3RoID4gMCA/IHVzZXIudGVhbXNbMF0udGVhbSA6IG51bGw7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiB1c2VyLmlkLnRvU3RyaW5nKCksXG4gICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgIGlzQWRtaW46IHVzZXIuaXNBZG1pbixcbiAgICAgICAgICBpc1N1cGVyQWRtaW46IHVzZXIuaXNTdXBlckFkbWluLFxuICAgICAgICAgIHRlYW06IHRlYW1cbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG4gIHBhZ2VzOiB7XG4gICAgc2lnbkluOiBcIi9sb2dpblwiLFxuICAgIGVycm9yOiBcIi9sb2dpblwiLFxuICB9LFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciwgdHJpZ2dlciB9KSB7XG4gICAgICBpZiAodXNlcikge1xuICAgICAgICAvLyBPbmx5IHVwZGF0ZSB0aGUgdG9rZW4gd2hlbiBhIHNpZ24gaW4gaGFwcGVuc1xuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWQ7XG4gICAgICAgIHRva2VuLmVtYWlsID0gdXNlci5lbWFpbDtcbiAgICAgICAgdG9rZW4ubmFtZSA9IHVzZXIubmFtZTtcbiAgICAgICAgdG9rZW4uaXNBZG1pbiA9IHVzZXIuaXNBZG1pbjtcbiAgICAgICAgdG9rZW4uaXNTdXBlckFkbWluID0gdXNlci5pc1N1cGVyQWRtaW47XG4gICAgICAgIHRva2VuLnRlYW0gPSB1c2VyLnRlYW07XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZDtcbiAgICAgICAgc2Vzc2lvbi51c2VyLmVtYWlsID0gdG9rZW4uZW1haWw7XG4gICAgICAgIHNlc3Npb24udXNlci5uYW1lID0gdG9rZW4ubmFtZTtcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlzQWRtaW4gPSB0b2tlbi5pc0FkbWluO1xuICAgICAgICBzZXNzaW9uLnVzZXIuaXNTdXBlckFkbWluID0gdG9rZW4uaXNTdXBlckFkbWluO1xuICAgICAgICBzZXNzaW9uLnVzZXIudGVhbSA9IHRva2VuLnRlYW07XG4gICAgICB9XG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxuICBzZXNzaW9uOiB7XG4gICAgc3RyYXRlZ3k6IFwiand0XCIsXG4gIH0sXG59O1xuXG5jb25zdCBoYW5kbGVyID0gTmV4dEF1dGgoYXV0aE9wdGlvbnMpO1xuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9O1xuIl0sIm5hbWVzIjpbIk5leHRBdXRoIiwiQ3JlZGVudGlhbHNQcm92aWRlciIsImJjcnlwdCIsInByaXNtYSIsImF1dGhPcHRpb25zIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsIkVycm9yIiwidXNlciIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsImluY2x1ZGUiLCJ0ZWFtcyIsInNlbGVjdCIsInRlYW0iLCJpZCIsImlzUGFzc3dvcmRWYWxpZCIsImNvbXBhcmUiLCJsZW5ndGgiLCJ0b1N0cmluZyIsImlzQWRtaW4iLCJpc1N1cGVyQWRtaW4iLCJwYWdlcyIsInNpZ25JbiIsImVycm9yIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJ0cmlnZ2VyIiwic2Vzc2lvbiIsInN0cmF0ZWd5IiwiaGFuZGxlciIsIkdFVCIsIlBPU1QiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/app/api/users/me/route.ts":
/*!***************************************!*\
  !*** ./src/app/api/users/me/route.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   PUT: () => (/* binding */ PUT)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n/* harmony import */ var _auth_nextauth_route__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../auth/[...nextauth]/route */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n // Import the singleton instance\n\n\n\nasync function GET(request) {\n    // Benutzer aus der Session identifizieren\n    const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_3__.getServerSession)(_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_4__.authOptions);\n    if (!session || !session.user?.id) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: \"Nicht authentifiziert\"\n        }, {\n            status: 401\n        });\n    }\n    const userId = parseInt(session.user.id);\n    try {\n        const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].user.findUnique({\n            where: {\n                id: userId\n            },\n            include: {\n                teams: {\n                    include: {\n                        team: {\n                            select: {\n                                id: true,\n                                name: true\n                            }\n                        }\n                    }\n                }\n            }\n        });\n        if (!user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                message: \"Benutzer nicht gefunden\"\n            }, {\n                status: 404\n            });\n        }\n        // Transformiere die Teams-Daten in ein einfacheres Format\n        const formattedUser = {\n            ...user,\n            teams: user.teams.map((ut)=>({\n                    id: ut.team.id,\n                    name: ut.team.name\n                })),\n            // Für Abwärtskompatibilität: Verwende das erste Team als Hauptteam\n            team: user.teams.length > 0 ? {\n                id: user.teams[0].team.id,\n                name: user.teams[0].team.name\n            } : null\n        };\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(formattedUser);\n    } catch (error) {\n        console.error(\"Fehler beim Abrufen des Benutzerprofils:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: \"Ein Fehler ist aufgetreten\"\n        }, {\n            status: 500\n        });\n    }\n// No finally block needed for singleton\n}\nasync function PUT(request) {\n    // Benutzer aus der Session identifizieren\n    const session = await (0,next_auth_next__WEBPACK_IMPORTED_MODULE_3__.getServerSession)(_auth_nextauth_route__WEBPACK_IMPORTED_MODULE_4__.authOptions);\n    if (!session || !session.user?.id) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: \"Nicht authentifiziert\"\n        }, {\n            status: 401\n        });\n    }\n    const userId = parseInt(session.user.id);\n    const { name, email, password, theme } = await request.json();\n    try {\n        const updateData = {\n            name,\n            email\n        };\n        if (password) {\n            const hashedPassword = await bcryptjs__WEBPACK_IMPORTED_MODULE_2___default().hash(password, 10);\n            updateData.password = hashedPassword;\n        }\n        if (theme) {\n            updateData.theme = theme;\n        }\n        const updatedUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__[\"default\"].user.update({\n            where: {\n                id: userId\n            },\n            data: updateData,\n            include: {\n                teams: {\n                    include: {\n                        team: {\n                            select: {\n                                id: true,\n                                name: true\n                            }\n                        }\n                    }\n                }\n            }\n        });\n        // Transformiere die Teams-Daten in ein einfacheres Format\n        const formattedUser = {\n            ...updatedUser,\n            teams: updatedUser.teams.map((ut)=>({\n                    id: ut.team.id,\n                    name: ut.team.name\n                })),\n            // Für Abwärtskompatibilität: Verwende das erste Team als Hauptteam\n            team: updatedUser.teams.length > 0 ? {\n                id: updatedUser.teams[0].team.id,\n                name: updatedUser.teams[0].team.name\n            } : null\n        };\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(formattedUser);\n    } catch (error) {\n        console.error(\"Fehler beim Aktualisieren des Benutzerprofils:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: \"Ein Fehler ist aufgetreten\"\n        }, {\n            status: 500\n        });\n    }\n// No finally block needed for singleton\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBQUksQ0FBQzRCLE1BQU0sQ0FBQztZQUMzQ3BCLE9BQU87Z0JBQUVQLElBQUlJO1lBQU87WUFDcEJ3QixNQUFNTDtZQUNOZixTQUFTO2dCQUNQQyxPQUFPO29CQUNMRCxTQUFTO3dCQUNQRSxNQUFNOzRCQUNKQyxRQUFRO2dDQUNOWCxJQUFJO2dDQUNKWSxNQUFNOzRCQUNSO3dCQUNGO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtRQUVBLDBEQUEwRDtRQUMxRCxNQUFNQyxnQkFBZ0I7WUFDcEIsR0FBR2EsV0FBVztZQUNkakIsT0FBT2lCLFlBQVlqQixLQUFLLENBQUNLLEdBQUcsQ0FBQ0MsQ0FBQUEsS0FBTztvQkFDbENmLElBQUllLEdBQUdMLElBQUksQ0FBQ1YsRUFBRTtvQkFDZFksTUFBTUcsR0FBR0wsSUFBSSxDQUFDRSxJQUFJO2dCQUNwQjtZQUNBLG1FQUFtRTtZQUNuRUYsTUFBTWdCLFlBQVlqQixLQUFLLENBQUNPLE1BQU0sR0FBRyxJQUFJO2dCQUNuQ2hCLElBQUkwQixZQUFZakIsS0FBSyxDQUFDLEVBQUUsQ0FBQ0MsSUFBSSxDQUFDVixFQUFFO2dCQUNoQ1ksTUFBTWMsWUFBWWpCLEtBQUssQ0FBQyxFQUFFLENBQUNDLElBQUksQ0FBQ0UsSUFBSTtZQUN0QyxJQUFJO1FBQ047UUFFQSxPQUFPckIscURBQVlBLENBQUNVLElBQUksQ0FBQ1k7SUFDM0IsRUFBRSxPQUFPSSxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyxrREFBa0RBO1FBQ2hFLE9BQU8xQixxREFBWUEsQ0FBQ1UsSUFBSSxDQUFDO1lBQUVDLFNBQVM7UUFBNkIsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDcEY7QUFDQSx3Q0FBd0M7QUFDMUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92b2xsZXliYWxsLWxpZ2EtbWFuYWdlci8uL3NyYy9hcHAvYXBpL3VzZXJzL21lL3JvdXRlLnRzPzQ0MTAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5pbXBvcnQgcHJpc21hIGZyb20gJy4uLy4uLy4uLy4uLy4uL2xpYi9wcmlzbWEnIC8vIEltcG9ydCB0aGUgc2luZ2xldG9uIGluc3RhbmNlXG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJ1xuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gJ25leHQtYXV0aC9uZXh0J1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICcuLi8uLi9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdDogUmVxdWVzdCkge1xuICAvLyBCZW51dHplciBhdXMgZGVyIFNlc3Npb24gaWRlbnRpZml6aWVyZW5cbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXG4gIFxuICBpZiAoIXNlc3Npb24gfHwgIXNlc3Npb24udXNlcj8uaWQpIHtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiAnTmljaHQgYXV0aGVudGlmaXppZXJ0JyB9LCB7IHN0YXR1czogNDAxIH0pXG4gIH1cbiAgXG4gIGNvbnN0IHVzZXJJZCA9IHBhcnNlSW50KHNlc3Npb24udXNlci5pZClcblxuICB0cnkge1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgIHdoZXJlOiB7IGlkOiB1c2VySWQgfSxcbiAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgdGVhbXM6IHtcbiAgICAgICAgICBpbmNsdWRlOiB7XG4gICAgICAgICAgICB0ZWFtOiB7XG4gICAgICAgICAgICAgIHNlbGVjdDoge1xuICAgICAgICAgICAgICAgIGlkOiB0cnVlLFxuICAgICAgICAgICAgICAgIG5hbWU6IHRydWUsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBpZiAoIXVzZXIpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IG1lc3NhZ2U6ICdCZW51dHplciBuaWNodCBnZWZ1bmRlbicgfSwgeyBzdGF0dXM6IDQwNCB9KVxuICAgIH1cblxuICAgIC8vIFRyYW5zZm9ybWllcmUgZGllIFRlYW1zLURhdGVuIGluIGVpbiBlaW5mYWNoZXJlcyBGb3JtYXRcbiAgICBjb25zdCBmb3JtYXR0ZWRVc2VyID0ge1xuICAgICAgLi4udXNlcixcbiAgICAgIHRlYW1zOiB1c2VyLnRlYW1zLm1hcCh1dCA9PiAoe1xuICAgICAgICBpZDogdXQudGVhbS5pZCxcbiAgICAgICAgbmFtZTogdXQudGVhbS5uYW1lXG4gICAgICB9KSksXG4gICAgICAvLyBGw7xyIEFid8OkcnRza29tcGF0aWJpbGl0w6R0OiBWZXJ3ZW5kZSBkYXMgZXJzdGUgVGVhbSBhbHMgSGF1cHR0ZWFtXG4gICAgICB0ZWFtOiB1c2VyLnRlYW1zLmxlbmd0aCA+IDAgPyB7XG4gICAgICAgIGlkOiB1c2VyLnRlYW1zWzBdLnRlYW0uaWQsXG4gICAgICAgIG5hbWU6IHVzZXIudGVhbXNbMF0udGVhbS5uYW1lXG4gICAgICB9IDogbnVsbFxuICAgIH1cblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihmb3JtYXR0ZWRVc2VyKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZlaGxlciBiZWltIEFicnVmZW4gZGVzIEJlbnV0emVycHJvZmlsczonLCBlcnJvcilcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiAnRWluIEZlaGxlciBpc3QgYXVmZ2V0cmV0ZW4nIH0sIHsgc3RhdHVzOiA1MDAgfSlcbiAgfVxuICAvLyBObyBmaW5hbGx5IGJsb2NrIG5lZWRlZCBmb3Igc2luZ2xldG9uXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQVVQocmVxdWVzdDogUmVxdWVzdCkge1xuICAvLyBCZW51dHplciBhdXMgZGVyIFNlc3Npb24gaWRlbnRpZml6aWVyZW5cbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXG4gIFxuICBpZiAoIXNlc3Npb24gfHwgIXNlc3Npb24udXNlcj8uaWQpIHtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBtZXNzYWdlOiAnTmljaHQgYXV0aGVudGlmaXppZXJ0JyB9LCB7IHN0YXR1czogNDAxIH0pXG4gIH1cbiAgXG4gIGNvbnN0IHVzZXJJZCA9IHBhcnNlSW50KHNlc3Npb24udXNlci5pZClcblxuICBjb25zdCB7IG5hbWUsIGVtYWlsLCBwYXNzd29yZCwgdGhlbWUgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpXG5cbiAgdHJ5IHtcbiAgICBjb25zdCB1cGRhdGVEYXRhOiBhbnkgPSB7IG5hbWUsIGVtYWlsIH1cblxuICAgIGlmIChwYXNzd29yZCkge1xuICAgICAgY29uc3QgaGFzaGVkUGFzc3dvcmQgPSBhd2FpdCBiY3J5cHQuaGFzaChwYXNzd29yZCwgMTApXG4gICAgICB1cGRhdGVEYXRhLnBhc3N3b3JkID0gaGFzaGVkUGFzc3dvcmRcbiAgICB9XG4gICAgXG4gICAgaWYgKHRoZW1lKSB7XG4gICAgICB1cGRhdGVEYXRhLnRoZW1lID0gdGhlbWVcbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGVkVXNlciA9IGF3YWl0IHByaXNtYS51c2VyLnVwZGF0ZSh7XG4gICAgICB3aGVyZTogeyBpZDogdXNlcklkIH0sXG4gICAgICBkYXRhOiB1cGRhdGVEYXRhLFxuICAgICAgaW5jbHVkZToge1xuICAgICAgICB0ZWFtczoge1xuICAgICAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgICAgIHRlYW06IHtcbiAgICAgICAgICAgICAgc2VsZWN0OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbmFtZTogdHJ1ZSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIC8vIFRyYW5zZm9ybWllcmUgZGllIFRlYW1zLURhdGVuIGluIGVpbiBlaW5mYWNoZXJlcyBGb3JtYXRcbiAgICBjb25zdCBmb3JtYXR0ZWRVc2VyID0ge1xuICAgICAgLi4udXBkYXRlZFVzZXIsXG4gICAgICB0ZWFtczogdXBkYXRlZFVzZXIudGVhbXMubWFwKHV0ID0+ICh7XG4gICAgICAgIGlkOiB1dC50ZWFtLmlkLFxuICAgICAgICBuYW1lOiB1dC50ZWFtLm5hbWVcbiAgICAgIH0pKSxcbiAgICAgIC8vIEbDvHIgQWJ3w6RydHNrb21wYXRpYmlsaXTDpHQ6IFZlcndlbmRlIGRhcyBlcnN0ZSBUZWFtIGFscyBIYXVwdHRlYW1cbiAgICAgIHRlYW06IHVwZGF0ZWRVc2VyLnRlYW1zLmxlbmd0aCA+IDAgPyB7XG4gICAgICAgIGlkOiB1cGRhdGVkVXNlci50ZWFtc1swXS50ZWFtLmlkLFxuICAgICAgICBuYW1lOiB1cGRhdGVkVXNlci50ZWFtc1swXS50ZWFtLm5hbWVcbiAgICAgIH0gOiBudWxsXG4gICAgfVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKGZvcm1hdHRlZFVzZXIpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRmVobGVyIGJlaW0gQWt0dWFsaXNpZXJlbiBkZXMgQmVudXR6ZXJwcm9maWxzOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IG1lc3NhZ2U6ICdFaW4gRmVobGVyIGlzdCBhdWZnZXRyZXRlbicgfSwgeyBzdGF0dXM6IDUwMCB9KVxuICB9XG4gIC8vIE5vIGZpbmFsbHkgYmxvY2sgbmVlZGVkIGZvciBzaW5nbGV0b25cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJwcmlzbWEiLCJiY3J5cHQiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJHRVQiLCJyZXF1ZXN0Iiwic2Vzc2lvbiIsInVzZXIiLCJpZCIsImpzb24iLCJtZXNzYWdlIiwic3RhdHVzIiwidXNlcklkIiwicGFyc2VJbnQiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJpbmNsdWRlIiwidGVhbXMiLCJ0ZWFtIiwic2VsZWN0IiwibmFtZSIsImZvcm1hdHRlZFVzZXIiLCJtYXAiLCJ1dCIsImxlbmd0aCIsImVycm9yIiwiY29uc29sZSIsIlBVVCIsImVtYWlsIiwicGFzc3dvcmQiLCJ0aGVtZSIsInVwZGF0ZURhdGEiLCJoYXNoZWRQYXNzd29yZCIsImhhc2giLCJ1cGRhdGVkVXNlciIsInVwZGF0ZSIsImRhdGEiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/users/me/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva","vendor-chunks/bcryptjs"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fusers%2Fme%2Froute&page=%2Fapi%2Fusers%2Fme%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fusers%2Fme%2Froute.ts&appDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();