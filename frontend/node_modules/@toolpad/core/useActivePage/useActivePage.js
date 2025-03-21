"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useActivePage = useActivePage;
var React = _interopRequireWildcard(require("react"));
var _context = require("../shared/context");
var _navigation = require("../shared/navigation");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function useActivePage() {
  const navigationContext = React.useContext(_context.NavigationContext);
  const routerContext = React.useContext(_context.RouterContext);
  const pathname = routerContext?.pathname ?? '/';
  const activeItem = (0, _navigation.matchPath)(navigationContext, pathname);
  const rootItem = (0, _navigation.matchPath)(navigationContext, '/');
  return React.useMemo(() => {
    if (!activeItem) {
      return null;
    }
    const breadcrumbs = [];
    if (rootItem) {
      breadcrumbs.push({
        title: (0, _navigation.getItemTitle)(rootItem),
        path: '/'
      });
    }
    const segments = pathname.split('/').filter(Boolean);
    let prefix = '';
    for (const segment of segments) {
      const path = `${prefix}/${segment}`;
      prefix = path;
      const item = (0, _navigation.matchPath)(navigationContext, path);
      if (!item) {
        continue;
      }
      const itemPath = (0, _navigation.getItemPath)(navigationContext, item);
      const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
      if (lastCrumb?.path !== itemPath) {
        breadcrumbs.push({
          title: (0, _navigation.getItemTitle)(item),
          path: itemPath
        });
      }
    }
    return {
      title: (0, _navigation.getItemTitle)(activeItem),
      path: (0, _navigation.getItemPath)(navigationContext, activeItem),
      breadcrumbs
    };
  }, [activeItem, rootItem, pathname, navigationContext]);
}