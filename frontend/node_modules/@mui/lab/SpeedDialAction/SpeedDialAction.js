'use client';

import * as React from 'react';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { jsx as _jsx } from "react/jsx-runtime";
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
export default /*#__PURE__*/React.forwardRef(function DeprecatedSpeedDialAction(props, ref) {
  warn();
  return /*#__PURE__*/_jsx(SpeedDialAction, {
    ref: ref,
    ...props
  });
});