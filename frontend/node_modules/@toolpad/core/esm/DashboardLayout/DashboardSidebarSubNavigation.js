'use client';

var _ExpandLessIcon, _ExpandMoreIcon;
import * as React from 'react';
import { styled } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Tooltip from '@mui/material/Tooltip';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from "../shared/Link.js";
import { RouterContext } from "../shared/context.js";
import { getItemTitle, getPageItemFullPath, hasSelectedNavigationChildren, isPageItemSelected } from "../shared/navigation.js";
import { getDrawerSxTransitionMixin } from "./utils.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const NavigationListItemButton = styled(ListItemButton)(({
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
  const routerContext = React.useContext(RouterContext);
  const pathname = routerContext?.pathname ?? '/';
  const initialExpandedSidebarItemIds = React.useMemo(() => subNavigation.map((navigationItem, navigationItemIndex) => ({
    navigationItem,
    originalIndex: navigationItemIndex
  })).filter(({
    navigationItem
  }) => hasSelectedNavigationChildren(navigationItem, basePath, pathname)).map(({
    originalIndex
  }) => `${depth}-${originalIndex}`), [basePath, depth, pathname, subNavigation]);
  const [expandedSidebarItemIds, setExpandedSidebarItemIds] = React.useState(initialExpandedSidebarItemIds);
  const handleOpenFolderClick = React.useCallback(itemId => () => {
    setExpandedSidebarItemIds(previousValue => previousValue.includes(itemId) ? previousValue.filter(previousValueItemId => previousValueItemId !== itemId) : [...previousValue, itemId]);
  }, []);
  return /*#__PURE__*/_jsx(List, {
    sx: {
      padding: 0,
      mb: depth === 0 ? 4 : 1,
      pl: 2 * depth
    },
    children: subNavigation.map((navigationItem, navigationItemIndex) => {
      if (navigationItem.kind === 'header') {
        return /*#__PURE__*/_jsx(ListSubheader, {
          component: "div",
          sx: {
            fontSize: 12,
            fontWeight: '700',
            height: isMini ? 0 : 40,
            ...(hasDrawerTransitions ? getDrawerSxTransitionMixin(isFullyExpanded, 'height') : {}),
            px: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            zIndex: 2
          },
          children: getItemTitle(navigationItem)
        }, `subheader-${depth}-${navigationItemIndex}`);
      }
      if (navigationItem.kind === 'divider') {
        const nextItem = subNavigation[navigationItemIndex + 1];
        return /*#__PURE__*/_jsx(Divider, {
          sx: {
            borderBottomWidth: 2,
            mx: 1,
            mt: 1,
            mb: nextItem?.kind === 'header' && !isMini ? 0 : 1,
            ...(hasDrawerTransitions ? getDrawerSxTransitionMixin(isFullyExpanded, 'margin') : {})
          }
        }, `divider-${depth}-${navigationItemIndex}`);
      }
      const navigationItemFullPath = getPageItemFullPath(basePath, navigationItem);
      const navigationItemId = `${depth}-${navigationItemIndex}`;
      const navigationItemTitle = getItemTitle(navigationItem);
      const isNestedNavigationExpanded = expandedSidebarItemIds.includes(navigationItemId);
      const nestedNavigationCollapseIcon = isNestedNavigationExpanded ? _ExpandLessIcon || (_ExpandLessIcon = /*#__PURE__*/_jsx(ExpandLessIcon, {})) : _ExpandMoreIcon || (_ExpandMoreIcon = /*#__PURE__*/_jsx(ExpandMoreIcon, {}));
      const listItemIconSize = 34;
      const isSelected = isPageItemSelected(navigationItem, basePath, pathname);
      if (process.env.NODE_ENV !== 'production' && isSelected && selectedItemId) {
        console.warn(`Duplicate selected path in navigation: ${navigationItemFullPath}`);
      }
      if (isSelected && !selectedItemId) {
        selectedItemId = navigationItemId;
      }
      const listItem = /*#__PURE__*/_jsx(ListItem, {
        sx: {
          py: 0,
          px: 1,
          overflowX: 'hidden'
        },
        children: /*#__PURE__*/_jsxs(NavigationListItemButton, {
          selected: isSelected && (!navigationItem.children || isMini),
          sx: {
            px: 1.4,
            height: 48
          },
          ...(navigationItem.children && !isMini ? {
            onClick: handleOpenFolderClick(navigationItemId)
          } : {
            LinkComponent: Link,
            href: navigationItemFullPath,
            onClick: onLinkClick
          }),
          children: [navigationItem.icon || isMini ? /*#__PURE__*/_jsxs(ListItemIcon, {
            sx: {
              minWidth: listItemIconSize,
              mr: 1.2
            },
            children: [navigationItem.icon ?? null, !navigationItem.icon && isMini ? /*#__PURE__*/_jsx(Avatar, {
              sx: {
                width: listItemIconSize - 7,
                height: listItemIconSize - 7,
                fontSize: 12,
                ml: '-2px'
              },
              children: navigationItemTitle.split(' ').slice(0, 2).map(itemTitleWord => itemTitleWord.charAt(0).toUpperCase())
            }) : null]
          }) : null, /*#__PURE__*/_jsx(ListItemText, {
            primary: navigationItemTitle,
            sx: {
              whiteSpace: 'nowrap',
              zIndex: 1
            }
          }), navigationItem.action && !isMini && isFullyExpanded ? navigationItem.action : null, navigationItem.children && !isMini && isFullyExpanded ? nestedNavigationCollapseIcon : null]
        })
      });
      return /*#__PURE__*/_jsxs(React.Fragment, {
        children: [isMini ? /*#__PURE__*/_jsx(Tooltip, {
          title: navigationItemTitle,
          placement: "right",
          children: listItem
        }) : listItem, navigationItem.children && !isMini ? /*#__PURE__*/_jsx(Collapse, {
          in: isNestedNavigationExpanded,
          timeout: "auto",
          unmountOnExit: true,
          children: /*#__PURE__*/_jsx(DashboardSidebarSubNavigation, {
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
export { DashboardSidebarSubNavigation };