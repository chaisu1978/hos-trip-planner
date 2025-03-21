"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _SpeedDial = _interopRequireDefault(require("@mui/material/SpeedDial"));
var _jsxRuntime = require("react/jsx-runtime");
let warnedOnce = false;
const warn = () => {
  if (!warnedOnce) {
    console.warn(['MUI: The SpeedDial component was moved from the lab to the core.', '', "You should use `import { SpeedDial } from '@mui/material'`", "or `import SpeedDial from '@mui/material/SpeedDial'`"].join('\n'));
    warnedOnce = true;
  }
};

/**
 * @ignore - do not document.
 */
var _default = exports.default = /*#__PURE__*/React.forwardRef(function DeprecatedSpeedDial(props, ref) {
  warn();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_SpeedDial.default, {
    ref: ref,
    ...props
  });
});