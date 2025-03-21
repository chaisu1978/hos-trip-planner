"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _PaginationItem = _interopRequireDefault(require("@mui/material/PaginationItem"));
var _jsxRuntime = require("react/jsx-runtime");
let warnedOnce = false;
const warn = () => {
  if (!warnedOnce) {
    console.warn(['MUI: The PaginationItem component was moved from the lab to the core.', '', "You should use `import { PaginationItem } from '@mui/material'`", "or `import PaginationItem from '@mui/material/PaginationItem'`"].join('\n'));
    warnedOnce = true;
  }
};

/**
 * @ignore - do not document.
 */
var _default = exports.default = /*#__PURE__*/React.forwardRef(function DeprecatedPaginationItem(props, ref) {
  warn();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_PaginationItem.default, {
    ref: ref,
    ...props
  });
});