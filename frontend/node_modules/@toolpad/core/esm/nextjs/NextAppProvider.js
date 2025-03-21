'use client';

import * as React from 'react';
import { useRouter } from 'next/compat/router';
import { NextAppProviderApp } from "./NextAppProviderApp.js";
import { NextAppProviderPages } from "./NextAppProviderPages.js";
import { jsx as _jsx } from "react/jsx-runtime";
function NextAppProvider(props) {
  const router = useRouter();
  const AppProvider = router ? NextAppProviderPages : NextAppProviderApp;
  return /*#__PURE__*/_jsx(AppProvider, {
    ...props
  });
}
export { NextAppProvider, /** TODO: Old usage, remove export from v0.14.0 */
/** @deprecated Import `NextAppProvider` instead. */
NextAppProvider as AppProvider };