"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DashboardSidebarSubNavigation = DashboardSidebarSubNavigation;
var React = _interopRequireWildcard(require("react"));
var _material = require("@mui/material");
var _Avatar = _interopRequireDefault(require("@mui/material/Avatar"));
var _Collapse = _interopRequireDefault(require("@mui/material/Collapse"));
var _Divider = _interopRequireDefault(require("@mui/material/Divider"));
var _List = _interopRequireDefault(require("@mui/material/List"));
var _ListItem = _interopRequireDefault(require("@mui/material/ListItem"));
var _ListItemButton = _interopRequireDefault(require("@mui/material/ListItemButton"));
var _ListItemIcon = _interopRequireDefault(require("@mui/material/ListItemIcon"));
var _ListItemText = _interopRequireDefault(require("@mui/material/ListItemText"));
var _ListSubheader = _interopRequireDefault(require("@mui/material/ListSubheader"));
var _Tooltip = _interopRequireDefault(require("@mui/material/Tooltip"));
var _ExpandLess = _interopRequireDefault(require("@mui/icons-material/ExpandLess"));
var _ExpandMore = _interopRequireDefault(require("@mui/icons-material/ExpandMore"));
var _Link = require("../shared/Link");
var _context = require("../shared/context");
var _navigation = require("../shared/navigation");
var _utils = require("./utils");
var _jsxRuntime = require("react/jsx-runtime");
var _ExpandLessIcon, _ExpandMoreIcon;
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const NavigationListItemButton = (0, _material.styled)(_ListItemButton.default)(({
  theme
}) => ({
  borderRadius: 8,
  '&.Mui-selected': {
    '& .MuiListItemIcon-root': {
      color: (theme.vars ?? theme).palette.primary.dark
    },
    '& .MuiTypography-root': {
      color: (theme.vars ?? theme).palette.text.primary
    },
    '& .MuiSvgIcon-root': {
      color: (theme.vars ?? theme).palette.primary.dark
    },
    '& .MuiAvatar-root': {
      backgroundColor: (theme.vars ?? theme).palette.primary.dark
    },
    '& .MuiTouchRipple-child': {
      backgroundColor: (theme.vars ?? theme).palette.primary.dark
    }
  },
  '& .MuiSvgIcon-root': {
    color: (theme.vars ?? theme).palette.action.active
  },
  '& .MuiAvatar-root': {
    backgroundColor: (theme.vars ?? theme).palette.action.active
  }
}));
/**
 * @ignore - internal component.
 */
function DashboardSidebarSubNavigation({
  subNavigation,
  basePath = '',
  depth = 0,
  onLinkClick,
  isMini = false,
  isFullyExpanded = true,
  hasDrawerTransitions = false,
  selectedItemId
}) {
  const routerContext = React.useContext(_context.RouterContext);
  const pathname = routerContext?.pathname ?? '/';
  const initialExpandedSidebarItemIds = React.useMemo(() => subNavigation.map((navigationItem, navigationItemIndex) => ({
    navigationItem,
    originalIndex: navigationItemIndex
  })).filter(({
    navigationItem
  }) => (0, _navigation.hasSelectedNavigationChildren)(navigationItem, basePath, pathname)).map(({
    originalIndex
  }) => `${depth}-${originalIndex}`), [basePath, depth, pathname, subNavigation]);
  const [expandedSidebarItemIds, setExpandedSidebarItemIds] = React.useState(initialExpandedSidebarItemIds);
  const handleOpenFolderClick = React.useCallback(itemId => () => {
    setExpandedSidebarItemIds(previousValue => previousValue.includes(itemId) ? previousValue.filter(previousValueItemId => previousValueItemId !== itemId) : [...previousValue, itemId]);
  }, []);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_List.default, {
    sx: {
      padding: 0,
      mb: depth === 0 ? 4 : 1,
      pl: 2 * depth
    },
    children: subNavigation.map((navigationItem, navigationItemIndex) => {
      if (navigationItem.kind === 'header') {
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_ListSubheader.default, {
          component: "div",
          sx: {
            fontSize: 12,
            fontWeight: '700',
            height: isMini ? 0 : 40,
            ...(hasDrawerTransitions ? (0, _utils.getDrawerSxTransitionMixin)(isFullyExpanded, 'height') : {}),
            px: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            zIndex: 2
          },
          children: (0, _navigation.getItemTitle)(navigationItem)
        }, `subheader-${depth}-${navigationItemIndex}`);
      }
      if (navigationItem.kind === 'divider') {
        const nextItem = subNavigation[navigationItemIndex + 1];
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Divider.default, {
          sx: {
            borderBottomWidth: 2,
            mx: 1,
            mt: 1,
            mb: nextItem?.kind === 'header' && !isMini ? 0 : 1,
            ...(hasDrawerTransitions ? (0, _utils.getDrawerSxTransitionMixin)(isFullyExpanded, 'margin') : {})
          }
        }, `divider-${depth}-${navigationItemIndex}`);
      }
      const navigationItemFullPath = (0, _navigation.getPageItemFullPath)(basePath, navigationItem);
      const navigationItemId = `${depth}-${navigationItemIndex}`;
      const navigationItemTitle = (0, _navigation.getItemTitle)(navigationItem);
      const isNestedNavigationExpanded = expandedSidebarItemIds.includes(navigationItemId);
      const nestedNavigationCollapseIcon = isNestedNavigationExpanded ? _ExpandLessIcon || (_ExpandLessIcon = /*#__PURE__*/(0, _jsxRuntime.jsx)(_ExpandLess.default, {})) : _ExpandMoreIcon || (_ExpandMoreIcon = /*#__PURE__*/(0, _jsxRuntime.jsx)(_ExpandMore.default, {}));
      const listItemIconSize = 34;
      const isSelected = (0, _navigation.isPageItemSelected)(navigationItem, basePath, pathname);
      if (process.env.NODE_ENV !== 'production' && isSelected && selectedItemId) {
        console.warn(`Duplicate selected path in navigation: ${navigationItemFullPath}`);
      }
      if (isSelected && !selectedItemId) {
        selectedItemId = navigationItemId;
      }
      const listItem = /*#__PURE__*/(0, _jsxRuntime.jsx)(_ListItem.default, {
        sx: {
          py: 0,
          px: 1,
          overflowX: 'hidden'
        },
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(NavigationListItemButton, {
          selected: isSelected && (!navigationItem.children || isMini),
          sx: {
            px: 1.4,
            height: 48
          },
          ...(navigationItem.children && !isMini ? {
            onClick: handleOpenFolderClick(navigationItemId)
          } : {
            LinkComponent: _Link.Link,
            href: navigationItemFullPath,
            onClick: onLinkClick
          }),
          children: [navigationItem.icon || isMini ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_ListItemIcon.default, {
            sx: {
              minWidth: listItemIconSize,
              mr: 1.2
            },
            children: [navigationItem.icon ?? null, !navigationItem.icon && isMini ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_Avatar.default, {
              sx: {
                width: listItemIconSize - 7,
                height: listItemIconSize - 7,
                fontSize: 12,
                ml: '-2px'
              },
              children: navigationItemTitle.split(' ').slice(0, 2).map(itemTitleWord => itemTitleWord.charAt(0).toUpperCase())
            }) : null]
          }) : null, /*#__PURE__*/(0, _jsxRuntime.jsx)(_ListItemText.default, {
            primary: navigationItemTitle,
            sx: {
              whiteSpace: 'nowrap',
              zIndex: 1
            }
          }), navigationItem.action && !isMini && isFullyExpanded ? navigationItem.action : null, navigationItem.children && !isMini && isFullyExpanded ? nestedNavigationCollapseIcon : null]
        })
      });
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
        children: [isMini ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_Tooltip.default, {
          title: navigationItemTitle,
          placement: "right",
          children: listItem
        }) : listItem, navigationItem.children && !isMini ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_Collapse.default, {
          in: isNestedNavigationExpanded,
          timeout: "auto",
          unmountOnExit: true,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DashboardSidebarSubNavigation, {
            subNavigation: navigationItem.children,
            basePath: navigationItemFullPath,
            depth: depth + 1,
            onLinkClick: onLinkClick,
            selectedItemId: selectedItemId
          })
        }) : null]
      }, navigationItemId);
    })
  });
}