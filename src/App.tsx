import {
  Box,
  Breadcrumbs,
  Link,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from '@mui/material';
import { ConfirmProvider } from 'material-ui-confirm';
import { SnackbarProvider } from 'notistack';
import React, { useState, useMemo, useRef, useContext, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import AuthWrapComponent from './AuthWrapComponent';
import TaskLogPage from './pages/admin/TaskLogPage';
import TaskPage from './pages/admin/TaskPage';
import Config from './pages/config/Config';
import MankaDetailPage from './pages/detail/MankaDetailPage';
import FavoriteList from './pages/list/FavoriteList';
import MankaListPage from './pages/list/MankaListPage';
import Login from './pages/login/Login';
import 'react-photo-view/dist/react-photo-view.css';
import {
  ChevronLeft,
  ChevronRight,
  DarkMode,
  LightMode,
  Menu,
} from '@mui/icons-material';
import {
  AppBar,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

const AppContext = React.createContext({
  setThemeMode: (mode: 'light' | 'dark') => {},
});

const MIN_SIDEBAR_WIDTH = 100;
const INITIAL_SIDEBAR_WIDTH = 200;

function Layout() {
  const theme = useTheme();
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    return savedWidth ? JSON.parse(savedWidth) : INITIAL_SIDEBAR_WIDTH;
  });
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState ? JSON.parse(savedState) : true;
  });
  const [isResizing, setIsResizing] = useState(false);

  const { setThemeMode } = useApp();

  useEffect(() => {
    localStorage.setItem('sidebarWidth', JSON.stringify(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(
        MIN_SIDEBAR_WIDTH,
        Math.min(
          // 限制最大宽度为窗口宽度的 40%
          Math.floor(window.innerWidth * 0.4),
          startWidth + e.clientX - startX,
        ),
      );
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleDoubleClick = () => {
    setSidebarWidth(INITIAL_SIDEBAR_WIDTH);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* 侧边栏区域 */}
      <Box
        sx={{
          width: isOpen ? sidebarWidth : 0,
          // 只在非拖拽状态下启用过渡效果
          transition: isResizing
            ? 'none'
            : theme.transitions.create(['width', 'opacity'], {
                duration: 300,
                easing: theme.transitions.easing.easeInOut,
              }),
          position: 'relative',
          borderRight: `1px solid ${theme.palette.divider}`,
          opacity: isOpen ? 1 : 0,
        }}
      >
        {/* resizer */}
        <Box
          sx={{
            position: 'absolute',
            right: -2,
            top: 0,
            bottom: 0,
            width: '4px',
            cursor: 'col-resize',
            zIndex: 1200,
            backgroundColor: isResizing
              ? theme.palette.primary.main
              : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.3),
            },
            '&:active': {
              backgroundColor: theme.palette.primary.main,
            },
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        />
        {/* 侧边栏内容区域 - 添加淡入淡出效果 */}
        <Box
          sx={{
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            opacity: isOpen ? 1 : 0,
            transition: theme.transitions.create('opacity', {
              duration: 200,
              easing: theme.transitions.easing.easeInOut,
            }),
          }}
        >
          <List sx={{ p: 1 }}>
            {[
              { text: 'Home', path: '/' },
              { text: 'Favorite', path: '/favorite' },
              { text: 'Tasks', path: '/tasks' },
              { text: 'Task Logs', path: '/taskLogs' },
              { text: 'Config', path: '/config' },
            ].map((item) => (
              <ListItemButton
                key={item.text}
                component={RouterLink}
                to={item.path}
                sx={{ borderRadius: 2 }}
              >
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>

      {/* 右侧内容区域 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar
          position="static"
          color="default"
          sx={{
            bgcolor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar
            sx={{
              gap: 2,
              justifyContent: 'space-between',
            }}
          >
            <IconButton onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>
            <IconButton
              onClick={() =>
                setThemeMode(theme.palette.mode === 'dark' ? 'light' : 'dark')
              }
            >
              {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* 内容区域 */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme
      ? JSON.parse(savedTheme)
      : prefersDarkMode
        ? 'dark'
        : 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', JSON.stringify(themeMode));
  }, [themeMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
        },
      }),
    [themeMode],
  );

  return (
    <AppContext.Provider value={{ setThemeMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ConfirmProvider>
          <SnackbarProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <AuthWrapComponent>
                      <Layout />
                    </AuthWrapComponent>
                  }
                >
                  <Route index element={<MankaListPage />} />
                  <Route path="favorite" element={<FavoriteList />} />
                  <Route path="tasks" element={<TaskPage />} />
                  <Route path="taskLogs" element={<TaskLogPage />} />
                  <Route path="manka/:mankaId" element={<MankaDetailPage />} />
                  <Route path="config" element={<Config />} />
                </Route>
                <Route path="*" element={<Navigate replace to="/" />} />
              </Routes>
            </BrowserRouter>
          </SnackbarProvider>
        </ConfirmProvider>
      </ThemeProvider>
    </AppContext.Provider>
  );
}

function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppContext');
  }
  return context;
}

export default App;
