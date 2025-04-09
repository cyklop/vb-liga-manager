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
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_schne1s_Documents_KI_PAGE_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./src/app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/Users/schne1s/Documents/KI_PAGE/src/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_schne1s_Documents_KI_PAGE_src_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnNjaG5lMXMlMkZEb2N1bWVudHMlMkZLSV9QQUdFJTJGc3JjJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnNjaG5lMXMlMkZEb2N1bWVudHMlMkZLSV9QQUdFJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUN3QjtBQUNyRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL3ZvbGxleWJhbGwtbGlnYS1tYW5hZ2VyLz84M2RkIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9zY2huZTFzL0RvY3VtZW50cy9LSV9QQUdFL3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvc2NobmUxcy9Eb2N1bWVudHMvS0lfUEFHRS9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcrypt__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcrypt */ \"bcrypt\");\n/* harmony import */ var bcrypt__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bcrypt__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"Credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"text\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                },\n                rememberMe: {\n                    label: \"Remember Me\",\n                    type: \"checkbox\"\n                } // Hinzugefügt\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Bitte geben Sie E-Mail und Passwort ein\");\n                }\n                // E-Mail normalisieren (Kleinschreibung, Leerzeichen entfernen)\n                const normalizedEmail = credentials.email.toLowerCase().trim();\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.user.findUnique({\n                    where: {\n                        email: normalizedEmail\n                    },\n                    include: {\n                        teams: {\n                            select: {\n                                team: {\n                                    select: {\n                                        id: true,\n                                        name: true\n                                    }\n                                }\n                            }\n                        }\n                    }\n                });\n                if (!user) {\n                    throw new Error(\"Benutzer nicht gefunden\");\n                }\n                const isPasswordValid = await bcrypt__WEBPACK_IMPORTED_MODULE_2___default().compare(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error(\"Ung\\xfcltiges Passwort\");\n                }\n                // Extract the first team if available\n                const team = user.teams.length > 0 ? user.teams[0].team : null;\n                const rememberUser = credentials.rememberMe === \"true\" || credentials.rememberMe === true; // Auslesen\n                return {\n                    id: user.id.toString(),\n                    email: user.email,\n                    name: user.name,\n                    isAdmin: user.isAdmin,\n                    isSuperAdmin: user.isSuperAdmin,\n                    team: team,\n                    rememberMe: rememberUser // Hinzugefügt\n                };\n            }\n        })\n    ],\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    callbacks: {\n        async jwt ({ token, user, trigger }) {\n            // Beim initialen Login (wenn user-Objekt vorhanden ist)\n            if (trigger === \"signIn\" && user) {\n                token.id = user.id;\n                token.email = user.email;\n                token.name = user.name;\n                token.isAdmin = user.isAdmin;\n                token.isSuperAdmin = user.isSuperAdmin;\n                token.team = user.team;\n                token.rememberMe = user.rememberMe; // Im Token speichern\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n                session.user.email = token.email;\n                session.user.name = token.name;\n                session.user.isAdmin = token.isAdmin;\n                session.user.isSuperAdmin = token.isSuperAdmin;\n                session.user.team = token.team; // Ggf. Typ anpassen\n                session.user.rememberMe = token.rememberMe; // In Session speichern\n            }\n            return session;\n        }\n    },\n    session: {\n        strategy: \"jwt\",\n        // Session-Dauer auf 30 Tage setzen, wenn \"Angemeldet bleiben\" genutzt wird\n        maxAge: 30 * 24 * 60 * 60\n    },\n    // Cookie-Dauer explizit setzen (sollte mit session.maxAge übereinstimmen)\n    cookies: {\n        sessionToken: {\n            name:  false ? 0 : `next-auth.session-token`,\n            options: {\n                httpOnly: true,\n                sameSite: \"lax\",\n                path: \"/\",\n                secure: \"development\" === \"production\",\n                maxAge: 30 * 24 * 60 * 60 // 30 days in seconds (gleiche Dauer wie Session)\n            }\n        }\n    }\n};\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQWlDO0FBQ2lDO0FBQ3RDO0FBQ1U7QUFFL0IsTUFBTUksY0FBYztJQUN6QkMsV0FBVztRQUNUSiwyRUFBbUJBLENBQUM7WUFDbEJLLE1BQU07WUFDTkMsYUFBYTtnQkFDWEMsT0FBTztvQkFBRUMsT0FBTztvQkFBU0MsTUFBTTtnQkFBTztnQkFDdENDLFVBQVU7b0JBQUVGLE9BQU87b0JBQVlDLE1BQU07Z0JBQVc7Z0JBQ2hERSxZQUFZO29CQUFFSCxPQUFPO29CQUFlQyxNQUFNO2dCQUFXLEVBQUUsY0FBYztZQUN2RTtZQUNBLE1BQU1HLFdBQVVOLFdBQVc7Z0JBQ3pCLElBQUksQ0FBQ0EsYUFBYUMsU0FBUyxDQUFDRCxhQUFhSSxVQUFVO29CQUNqRCxNQUFNLElBQUlHLE1BQU07Z0JBQ2xCO2dCQUVBLGdFQUFnRTtnQkFDaEUsTUFBTUMsa0JBQWtCUixZQUFZQyxLQUFLLENBQUNRLFdBQVcsR0FBR0MsSUFBSTtnQkFFNUQsTUFBTUMsT0FBTyxNQUFNZiwrQ0FBTUEsQ0FBQ2UsSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3hDQyxPQUFPO3dCQUFFWixPQUFPTztvQkFBZ0I7b0JBQ2hDTSxTQUFTO3dCQUNQQyxPQUFPOzRCQUNMQyxRQUFRO2dDQUNOQyxNQUFNO29DQUNKRCxRQUFRO3dDQUNORSxJQUFJO3dDQUNKbkIsTUFBTTtvQ0FDUjtnQ0FDRjs0QkFDRjt3QkFDRjtvQkFDRjtnQkFDRjtnQkFFQSxJQUFJLENBQUNZLE1BQU07b0JBQ1QsTUFBTSxJQUFJSixNQUFNO2dCQUNsQjtnQkFFQSxNQUFNWSxrQkFBa0IsTUFBTXhCLHFEQUFjLENBQzFDSyxZQUFZSSxRQUFRLEVBQ3BCTyxLQUFLUCxRQUFRO2dCQUdmLElBQUksQ0FBQ2UsaUJBQWlCO29CQUNwQixNQUFNLElBQUlaLE1BQU07Z0JBQ2xCO2dCQUVBLHNDQUFzQztnQkFDdEMsTUFBTVUsT0FBT04sS0FBS0ksS0FBSyxDQUFDTSxNQUFNLEdBQUcsSUFBSVYsS0FBS0ksS0FBSyxDQUFDLEVBQUUsQ0FBQ0UsSUFBSSxHQUFHO2dCQUMxRCxNQUFNSyxlQUFldEIsWUFBWUssVUFBVSxLQUFLLFVBQVVMLFlBQVlLLFVBQVUsS0FBSyxNQUFNLFdBQVc7Z0JBRXRHLE9BQU87b0JBQ0xhLElBQUlQLEtBQUtPLEVBQUUsQ0FBQ0ssUUFBUTtvQkFDcEJ0QixPQUFPVSxLQUFLVixLQUFLO29CQUNqQkYsTUFBTVksS0FBS1osSUFBSTtvQkFDZnlCLFNBQVNiLEtBQUthLE9BQU87b0JBQ3JCQyxjQUFjZCxLQUFLYyxZQUFZO29CQUMvQlIsTUFBTUE7b0JBQ05aLFlBQVlpQixhQUFhLGNBQWM7Z0JBQ3pDO1lBQ0Y7UUFDRjtLQUNEO0lBQ0RJLE9BQU87UUFDTEMsUUFBUTtRQUNSQyxPQUFPO0lBQ1Q7SUFDQUMsV0FBVztRQUNULE1BQU1DLEtBQUksRUFBRUMsS0FBSyxFQUFFcEIsSUFBSSxFQUFFcUIsT0FBTyxFQUFFO1lBQ2hDLHdEQUF3RDtZQUN4RCxJQUFJQSxZQUFZLFlBQVlyQixNQUFNO2dCQUNoQ29CLE1BQU1iLEVBQUUsR0FBR1AsS0FBS08sRUFBRTtnQkFDbEJhLE1BQU05QixLQUFLLEdBQUdVLEtBQUtWLEtBQUs7Z0JBQ3hCOEIsTUFBTWhDLElBQUksR0FBR1ksS0FBS1osSUFBSTtnQkFDdEJnQyxNQUFNUCxPQUFPLEdBQUdiLEtBQUthLE9BQU87Z0JBQzVCTyxNQUFNTixZQUFZLEdBQUdkLEtBQUtjLFlBQVk7Z0JBQ3RDTSxNQUFNZCxJQUFJLEdBQUdOLEtBQUtNLElBQUk7Z0JBQ3RCYyxNQUFNMUIsVUFBVSxHQUFHTSxLQUFLTixVQUFVLEVBQUUscUJBQXFCO1lBQzNEO1lBQ0EsT0FBTzBCO1FBQ1Q7UUFDQSxNQUFNRSxTQUFRLEVBQUVBLE9BQU8sRUFBRUYsS0FBSyxFQUFFO1lBQzlCLElBQUlFLFFBQVF0QixJQUFJLEVBQUU7Z0JBQ2hCc0IsUUFBUXRCLElBQUksQ0FBQ08sRUFBRSxHQUFHYSxNQUFNYixFQUFFO2dCQUMxQmUsUUFBUXRCLElBQUksQ0FBQ1YsS0FBSyxHQUFHOEIsTUFBTTlCLEtBQUs7Z0JBQ2hDZ0MsUUFBUXRCLElBQUksQ0FBQ1osSUFBSSxHQUFHZ0MsTUFBTWhDLElBQUk7Z0JBQzlCa0MsUUFBUXRCLElBQUksQ0FBQ2EsT0FBTyxHQUFHTyxNQUFNUCxPQUFPO2dCQUNwQ1MsUUFBUXRCLElBQUksQ0FBQ2MsWUFBWSxHQUFHTSxNQUFNTixZQUFZO2dCQUM5Q1EsUUFBUXRCLElBQUksQ0FBQ00sSUFBSSxHQUFHYyxNQUFNZCxJQUFJLEVBQVMsb0JBQW9CO2dCQUMzRGdCLFFBQVF0QixJQUFJLENBQUNOLFVBQVUsR0FBRzBCLE1BQU0xQixVQUFVLEVBQWEsdUJBQXVCO1lBQ2hGO1lBQ0EsT0FBTzRCO1FBQ1Q7SUFDRjtJQUNBQSxTQUFTO1FBQ1BDLFVBQVU7UUFDViwyRUFBMkU7UUFDM0VDLFFBQVEsS0FBSyxLQUFLLEtBQUs7SUFDekI7SUFDQSwwRUFBMEU7SUFDMUVDLFNBQVM7UUFDTkMsY0FBYztZQUNadEMsTUFBTXVDLE1BQXlCLEdBQzNCLENBQWtDLEdBQ2xDLENBQUMsdUJBQXVCLENBQUM7WUFDN0JDLFNBQVM7Z0JBQ1BDLFVBQVU7Z0JBQ1ZDLFVBQVU7Z0JBQ1ZDLE1BQU07Z0JBQ05DLFFBQVFMLGtCQUF5QjtnQkFDakNILFFBQVEsS0FBSyxLQUFLLEtBQUssR0FBRyxpREFBaUQ7WUFDN0U7UUFDRjtJQUNIO0FBQ0YsRUFBRTtBQUVGLE1BQU1TLFVBQVVuRCxnREFBUUEsQ0FBQ0k7QUFDa0IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly92b2xsZXliYWxsLWxpZ2EtbWFuYWdlci8uL3NyYy9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cz8wMDk4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgQ3JlZGVudGlhbHNQcm92aWRlciBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFsc1wiO1xuaW1wb3J0IGJjcnlwdCBmcm9tIFwiYmNyeXB0XCI7XG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9saWIvcHJpc21hXCI7XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9ucyA9IHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICBuYW1lOiBcIkNyZWRlbnRpYWxzXCIsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcInRleHRcIiB9LFxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJQYXNzd29yZFwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfSxcbiAgICAgICAgcmVtZW1iZXJNZTogeyBsYWJlbDogXCJSZW1lbWJlciBNZVwiLCB0eXBlOiBcImNoZWNrYm94XCIgfSAvLyBIaW56dWdlZsO8Z3RcbiAgICAgIH0sXG4gICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzPy5wYXNzd29yZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJpdHRlIGdlYmVuIFNpZSBFLU1haWwgdW5kIFBhc3N3b3J0IGVpblwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEUtTWFpbCBub3JtYWxpc2llcmVuIChLbGVpbnNjaHJlaWJ1bmcsIExlZXJ6ZWljaGVuIGVudGZlcm5lbilcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZEVtYWlsID0gY3JlZGVudGlhbHMuZW1haWwudG9Mb3dlckNhc2UoKS50cmltKCk7XG5cbiAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiBub3JtYWxpemVkRW1haWwgfSwgLy8gU3VjaGUgbWl0IG5vcm1hbGlzaWVydGVyIEUtTWFpbFxuICAgICAgICAgIGluY2x1ZGU6IHtcbiAgICAgICAgICAgIHRlYW1zOiB7XG4gICAgICAgICAgICAgIHNlbGVjdDoge1xuICAgICAgICAgICAgICAgIHRlYW06IHtcbiAgICAgICAgICAgICAgICAgIHNlbGVjdDoge1xuICAgICAgICAgICAgICAgICAgICBpZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmVudXR6ZXIgbmljaHQgZ2VmdW5kZW5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1Bhc3N3b3JkVmFsaWQgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShcbiAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgICB1c2VyLnBhc3N3b3JkXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmfDvGx0aWdlcyBQYXNzd29ydFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEV4dHJhY3QgdGhlIGZpcnN0IHRlYW0gaWYgYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IHRlYW0gPSB1c2VyLnRlYW1zLmxlbmd0aCA+IDAgPyB1c2VyLnRlYW1zWzBdLnRlYW0gOiBudWxsO1xuICAgICAgICBjb25zdCByZW1lbWJlclVzZXIgPSBjcmVkZW50aWFscy5yZW1lbWJlck1lID09PSAndHJ1ZScgfHwgY3JlZGVudGlhbHMucmVtZW1iZXJNZSA9PT0gdHJ1ZTsgLy8gQXVzbGVzZW5cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiB1c2VyLmlkLnRvU3RyaW5nKCksXG4gICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgIGlzQWRtaW46IHVzZXIuaXNBZG1pbixcbiAgICAgICAgICBpc1N1cGVyQWRtaW46IHVzZXIuaXNTdXBlckFkbWluLFxuICAgICAgICAgIHRlYW06IHRlYW0sXG4gICAgICAgICAgcmVtZW1iZXJNZTogcmVtZW1iZXJVc2VyIC8vIEhpbnp1Z2Vmw7xndFxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46IFwiL2xvZ2luXCIsXG4gICAgZXJyb3I6IFwiL2xvZ2luXCIsXG4gIH0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyLCB0cmlnZ2VyIH0pIHtcbiAgICAgIC8vIEJlaW0gaW5pdGlhbGVuIExvZ2luICh3ZW5uIHVzZXItT2JqZWt0IHZvcmhhbmRlbiBpc3QpXG4gICAgICBpZiAodHJpZ2dlciA9PT0gJ3NpZ25JbicgJiYgdXNlcikge1xuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWQ7XG4gICAgICAgIHRva2VuLmVtYWlsID0gdXNlci5lbWFpbDtcbiAgICAgICAgdG9rZW4ubmFtZSA9IHVzZXIubmFtZTtcbiAgICAgICAgdG9rZW4uaXNBZG1pbiA9IHVzZXIuaXNBZG1pbjtcbiAgICAgICAgdG9rZW4uaXNTdXBlckFkbWluID0gdXNlci5pc1N1cGVyQWRtaW47XG4gICAgICAgIHRva2VuLnRlYW0gPSB1c2VyLnRlYW07XG4gICAgICAgIHRva2VuLnJlbWVtYmVyTWUgPSB1c2VyLnJlbWVtYmVyTWU7IC8vIEltIFRva2VuIHNwZWljaGVyblxuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIGlmIChzZXNzaW9uLnVzZXIpIHtcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4uaWQ7XG4gICAgICAgIHNlc3Npb24udXNlci5lbWFpbCA9IHRva2VuLmVtYWlsO1xuICAgICAgICBzZXNzaW9uLnVzZXIubmFtZSA9IHRva2VuLm5hbWU7XG4gICAgICAgIHNlc3Npb24udXNlci5pc0FkbWluID0gdG9rZW4uaXNBZG1pbiBhcyBib29sZWFuO1xuICAgICAgICBzZXNzaW9uLnVzZXIuaXNTdXBlckFkbWluID0gdG9rZW4uaXNTdXBlckFkbWluIGFzIGJvb2xlYW47XG4gICAgICAgIHNlc3Npb24udXNlci50ZWFtID0gdG9rZW4udGVhbSBhcyBhbnk7IC8vIEdnZi4gVHlwIGFucGFzc2VuXG4gICAgICAgIHNlc3Npb24udXNlci5yZW1lbWJlck1lID0gdG9rZW4ucmVtZW1iZXJNZSBhcyBib29sZWFuOyAvLyBJbiBTZXNzaW9uIHNwZWljaGVyblxuICAgICAgfVxuICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgfSxcbiAgfSxcbiAgc2Vzc2lvbjoge1xuICAgIHN0cmF0ZWd5OiBcImp3dFwiLFxuICAgIC8vIFNlc3Npb24tRGF1ZXIgYXVmIDMwIFRhZ2Ugc2V0emVuLCB3ZW5uIFwiQW5nZW1lbGRldCBibGVpYmVuXCIgZ2VudXR6dCB3aXJkXG4gICAgbWF4QWdlOiAzMCAqIDI0ICogNjAgKiA2MCwgLy8gMzAgZGF5cyBpbiBzZWNvbmRzXG4gIH0sXG4gIC8vIENvb2tpZS1EYXVlciBleHBsaXppdCBzZXR6ZW4gKHNvbGx0ZSBtaXQgc2Vzc2lvbi5tYXhBZ2Ugw7xiZXJlaW5zdGltbWVuKVxuICBjb29raWVzOiB7XG4gICAgIHNlc3Npb25Ub2tlbjoge1xuICAgICAgIG5hbWU6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgXG4gICAgICAgICA/IGBfX1NlY3VyZS1uZXh0LWF1dGguc2Vzc2lvbi10b2tlbmAgXG4gICAgICAgICA6IGBuZXh0LWF1dGguc2Vzc2lvbi10b2tlbmAsIC8vIFVudGVyc2NoaWVkbGljaGUgTmFtZW4gZsO8ciBEZXYvUHJvZFxuICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgIGh0dHBPbmx5OiB0cnVlLFxuICAgICAgICAgc2FtZVNpdGU6ICdsYXgnLFxuICAgICAgICAgcGF0aDogJy8nLFxuICAgICAgICAgc2VjdXJlOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nLFxuICAgICAgICAgbWF4QWdlOiAzMCAqIDI0ICogNjAgKiA2MCAvLyAzMCBkYXlzIGluIHNlY29uZHMgKGdsZWljaGUgRGF1ZXIgd2llIFNlc3Npb24pXG4gICAgICAgfVxuICAgICB9XG4gIH1cbn07XG5cbmNvbnN0IGhhbmRsZXIgPSBOZXh0QXV0aChhdXRoT3B0aW9ucyk7XG5leHBvcnQgeyBoYW5kbGVyIGFzIEdFVCwgaGFuZGxlciBhcyBQT1NUIH07XG4iXSwibmFtZXMiOlsiTmV4dEF1dGgiLCJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiYmNyeXB0IiwicHJpc21hIiwiYXV0aE9wdGlvbnMiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwicmVtZW1iZXJNZSIsImF1dGhvcml6ZSIsIkVycm9yIiwibm9ybWFsaXplZEVtYWlsIiwidG9Mb3dlckNhc2UiLCJ0cmltIiwidXNlciIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsImluY2x1ZGUiLCJ0ZWFtcyIsInNlbGVjdCIsInRlYW0iLCJpZCIsImlzUGFzc3dvcmRWYWxpZCIsImNvbXBhcmUiLCJsZW5ndGgiLCJyZW1lbWJlclVzZXIiLCJ0b1N0cmluZyIsImlzQWRtaW4iLCJpc1N1cGVyQWRtaW4iLCJwYWdlcyIsInNpZ25JbiIsImVycm9yIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJ0cmlnZ2VyIiwic2Vzc2lvbiIsInN0cmF0ZWd5IiwibWF4QWdlIiwiY29va2llcyIsInNlc3Npb25Ub2tlbiIsInByb2Nlc3MiLCJvcHRpb25zIiwiaHR0cE9ubHkiLCJzYW1lU2l0ZSIsInBhdGgiLCJzZWN1cmUiLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/[...nextauth]/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/next-auth","vendor-chunks/oauth","vendor-chunks/@babel","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fschne1s%2FDocuments%2FKI_PAGE&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();