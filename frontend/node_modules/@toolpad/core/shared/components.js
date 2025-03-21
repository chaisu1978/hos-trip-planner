"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ErrorOverlay = ErrorOverlay;
exports.LoadingOverlay = LoadingOverlay;
var React = _interopRequireWildcard(require("react"));
var _material = require("@mui/material");
var _Error = _interopRequireDefault(require("@mui/icons-material/Error"));
var _jsxRuntime = require("react/jsx-runtime");
var _ErrorIcon, _OverlayRoot;
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const OverlayRoot = (0, _material.styled)('div')(({
  theme
}) => ({
  position: 'absolute',
  inset: '0 0 0 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2)
}));
function ErrorOverlay({
  error
}) {
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(OverlayRoot, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_material.Typography, {
      variant: "h6",
      sx: {
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
        alignItems: 'center'
      },
      children: [_ErrorIcon || (_ErrorIcon = /*#__PURE__*/(0, _jsxRuntime.jsx)(_Error.default, {
        color: "error"
      })), " Error"]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_material.Typography, {
      textAlign: "center",
      children: error?.message ?? 'Unknown error'
    })]
  });
}
function LoadingOverlay() {
  return _OverlayRoot || (_OverlayRoot = /*#__PURE__*/(0, _jsxRuntime.jsx)(OverlayRoot, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_material.CircularProgress, {})
  }));
}