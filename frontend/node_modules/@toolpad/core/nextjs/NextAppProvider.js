"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppProvider = exports.NextAppProvider = NextAppProvider;
var React = _interopRequireWildcard(require("react"));
var _router = require("next/compat/router");
var _NextAppProviderApp = require("./NextAppProviderApp");
var _NextAppProviderPages = require("./NextAppProviderPages");
var _jsxRuntime = require("react/jsx-runtime");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function NextAppProvider(props) {
  const router = (0, _router.useRouter)();
  const AppProvider = router ? _NextAppProviderPages.NextAppProviderPages : _NextAppProviderApp.NextAppProviderApp;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(AppProvider, {
    ...props
  });
}