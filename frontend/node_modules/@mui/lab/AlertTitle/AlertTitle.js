'use client';

import * as React from 'react';
import AlertTitle from '@mui/material/AlertTitle';
import { jsx as _jsx } from "react/jsx-runtime";
let warnedOnce = false;
const warn = () => {
  if (!warnedOnce) {
    console.warn(['MUI: The AlertTitle component was moved from the lab to the core.', '', "You should use `import { AlertTitle } from '@mui/material'`", "or `import AlertTitle from '@mui/material/AlertTitle'`"].join('\n'));
    warnedOnce = true;
  }
};

/**
 * @ignore - do not document.
 */
export default /*#__PURE__*/React.forwardRef(function DeprecatedAlertTitle(props, ref) {
  warn();
  return /*#__PURE__*/_jsx(AlertTitle, {
    ref: ref,
    ...props
  });
});