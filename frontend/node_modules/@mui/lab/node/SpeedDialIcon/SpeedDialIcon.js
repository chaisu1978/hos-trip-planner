"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SpeedDialIcon = _interopRequireDefault(require("@mui/material/SpeedDialIcon"));
var _jsxRuntime = require("react/jsx-runtime");
let warnedOnce = false;
const warn = () => {
  if (!warnedOnce) {
    console.warn(['MUI: The SpeedDialIcon component was moved from the lab to the core.', '', "You should use `import { SpeedDialIcon } from '@mui/material'`", "or `import SpeedDialIcon from '@mui/material/SpeedDialIcon'`"].join('\n'));
    warnedOnce = true;
  }
};

/**
 * @ignore - do not document.
 */
var _default = exports.default = /*#__PURE__*/React.forwardRef(function DeprecatedSpeedDialIcon(props, ref) {
  warn();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_SpeedDialIcon.default, {
    ref: ref,
    ...props
  });
});