'use client';

import * as React from 'react';
import PaginationItem from '@mui/material/PaginationItem';
import { jsx as _jsx } from "react/jsx-runtime";
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
export default /*#__PURE__*/React.forwardRef(function DeprecatedPaginationItem(props, ref) {
  warn();
  return /*#__PURE__*/_jsx(PaginationItem, {
    ref: ref,
    ...props
  });
});