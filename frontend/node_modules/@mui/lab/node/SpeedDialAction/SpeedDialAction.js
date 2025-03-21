"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SpeedDialAction = _interopRequireDefault(require("@mui/material/SpeedDialAction"));
var _jsxRuntime = require("react/jsx-runtime");
let warnedOnce = false;
const warn = () => {
  if (!warnedOnce) {
    console.warn(['MUI: The SpeedDialAction component was moved from the lab to the core.', '', "You should use `import { SpeedDialAction } from '@mui/material'`", "or `import SpeedDialAction from '@mui/material/SpeedDialAction'`"].join('\n'));
    warnedOnce = true;
  }
};

/**
 * @ignore - do not document.
 */
var _default = exports.default = /*#__PURE__*/React.forwardRef(function DeprecatedSpeedDialAction(props, ref) {
  warn();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_SpeedDialAction.default, {
    ref: ref,
    ...props
  });
});