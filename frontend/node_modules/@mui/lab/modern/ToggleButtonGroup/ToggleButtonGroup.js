'use client';

import * as React from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { jsx as _jsx } from "react/jsx-runtime";
let warnedOnce = false;
const warn = () => {
  if (!warnedOnce) {
    console.warn(['MUI: The ToggleButtonGroup component was moved from the lab to the core.', '', "You should use `import { ToggleButtonGroup } from '@mui/material'`", "or `import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'`"].join('\n'));
    warnedOnce = true;
  }
};

/**
 * @ignore - do not document.
 */
export default /*#__PURE__*/React.forwardRef(function DeprecatedToggleButtonGroup(props, ref) {
  warn();
  return /*#__PURE__*/_jsx(ToggleButtonGroup, {
    ref: ref,
    ...props
  });
});