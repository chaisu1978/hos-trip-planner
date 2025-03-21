'use client';

import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import { jsx as _jsx } from "react/jsx-runtime";
let warnedOnce = false;
const warn = () => {
  if (!warnedOnce) {
    console.warn(['MUI: The ToggleButton component was moved from the lab to the core.', '', "You should use `import { ToggleButton } from '@mui/material'`", "or `import ToggleButton from '@mui/material/ToggleButton'`"].join('\n'));
    warnedOnce = true;
  }
};

/**
 * @ignore - do not document.
 */
export default /*#__PURE__*/React.forwardRef(function DeprecatedToggleButton(props, ref) {
  warn();
  return /*#__PURE__*/_jsx(ToggleButton, {
    ref: ref,
    ...props
  });
});