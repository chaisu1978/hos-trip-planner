"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarActions = ToolbarActions;
var React = _interopRequireWildcard(require("react"));
var _Stack2 = _interopRequireDefault(require("@mui/material/Stack"));
var _ThemeSwitcher = require("./ThemeSwitcher");
var _jsxRuntime = require("react/jsx-runtime");
var _Stack;
/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [ToolbarActions API](https://mui.com/toolpad/core/api/toolbar-actions)
 */
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function ToolbarActions() {
  return _Stack || (_Stack = /*#__PURE__*/(0, _jsxRuntime.jsx)(_Stack2.default, {
    direction: "row",
    alignItems: "center",
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_ThemeSwitcher.ThemeSwitcher, {})
  }));
}