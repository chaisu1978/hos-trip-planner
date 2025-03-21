"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getItemKind = void 0;
exports.getItemPath = getItemPath;
exports.getItemTitle = void 0;
exports.getPageItemFullPath = getPageItemFullPath;
exports.hasSelectedNavigationChildren = hasSelectedNavigationChildren;
exports.isPageItem = void 0;
exports.isPageItemSelected = isPageItemSelected;
exports.matchPath = matchPath;
var _pathToRegexp = require("path-to-regexp");
var _invariant = _interopRequireDefault(require("invariant"));
const getItemKind = item => item.kind ?? 'page';
exports.getItemKind = getItemKind;
const isPageItem = item => getItemKind(item) === 'page';
exports.isPageItem = isPageItem;
const getItemTitle = item => {
  return isPageItem(item) ? item.title ?? item.segment ?? '' : item.title;
};
exports.getItemTitle = getItemTitle;
function getPageItemFullPath(basePath, navigationItem) {
  return `${basePath}${basePath && !navigationItem.segment ? '' : '/'}${navigationItem.segment ?? ''}`;
}
function isPageItemSelected(navigationItem, basePath, pathname) {
  return navigationItem.pattern ? (0, _pathToRegexp.pathToRegexp)(`${basePath}/${navigationItem.pattern}`).test(pathname) : getPageItemFullPath(basePath, navigationItem) === pathname;
}
function hasSelectedNavigationChildren(navigationItem, basePath, pathname) {
  if (isPageItem(navigationItem) && navigationItem.children) {
    const navigationItemFullPath = getPageItemFullPath(basePath, navigationItem);
    return navigationItem.children.some(nestedNavigationItem => {
      if (!isPageItem(nestedNavigationItem)) {
        return false;
      }
      if (nestedNavigationItem.children) {
        return hasSelectedNavigationChildren(nestedNavigationItem, navigationItemFullPath, pathname);
      }
      return isPageItemSelected(nestedNavigationItem, navigationItemFullPath, pathname);
    });
  }
  return false;
}

/**
 * Builds a map of navigation page items to their respective paths. This map is used to quickly
 * lookup the path of a navigation item. It will be cached for the lifetime of the navigation.
 */
function buildItemToPathMap(navigation) {
  const map = new Map();
  const visit = (item, base) => {
    if (isPageItem(item)) {
      const path = `${base}${item.segment ? `/${item.segment}` : ''}` || '/';
      map.set(item, path);
      if (item.children) {
        for (const child of item.children) {
          visit(child, path);
        }
      }
    }
  };
  for (const item of navigation) {
    visit(item, '');
  }
  return map;
}
const itemToPathMapCache = new WeakMap();

/**
 * Gets the cached map of navigation page items to their respective paths.
 */
function getItemToPathMap(navigation) {
  let map = itemToPathMapCache.get(navigation);
  if (!map) {
    map = buildItemToPathMap(navigation);
    itemToPathMapCache.set(navigation, map);
  }
  return map;
}

/**
 * Build a lookup map of paths to navigation items. This map is used to match paths against
 * to find the active page.
 */
function buildItemLookup(navigation) {
  const map = new Map();
  const visit = item => {
    if (isPageItem(item)) {
      const path = getItemPath(navigation, item);
      if (map.has(path)) {
        console.warn(`Duplicate path in navigation: ${path}`);
      }
      map.set(path, item);
      if (item.pattern) {
        const basePath = item.segment ? path.slice(0, -item.segment.length) : path;
        map.set((0, _pathToRegexp.pathToRegexp)(basePath + item.pattern), item);
      }
      if (item.children) {
        for (const child of item.children) {
          visit(child);
        }
      }
    }
  };
  for (const item of navigation) {
    visit(item);
  }
  return map;
}
const itemLookupMapCache = new WeakMap();
function getItemLookup(navigation) {
  let map = itemLookupMapCache.get(navigation);
  if (!map) {
    map = buildItemLookup(navigation);
    itemLookupMapCache.set(navigation, map);
  }
  return map;
}

/**
 * Matches a path against the navigation to find the active page. i.e. the page that should be
 * marked as selected in the navigation.
 */
function matchPath(navigation, path) {
  const lookup = getItemLookup(navigation);
  for (const [key, item] of lookup.entries()) {
    if (typeof key === 'string' && key === path) {
      return item;
    }
    if (key instanceof RegExp && key.test(path)) {
      return item;
    }
  }
  return null;
}

/**
 * Gets the path for a specific navigation page item.
 */
function getItemPath(navigation, item) {
  const map = getItemToPathMap(navigation);
  const path = map.get(item);
  (0, _invariant.default)(path, `Item not found in navigation: ${item.title}`);
  return path;
}