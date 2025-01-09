import {
  Breadcrumbs,
  Link,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from '@mui/material';
import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthWrapComponent from './AuthWrapComponent';
import TaskLogPage from './pages/admin/TaskLogPage';
import TaskPage from './pages/admin/TaskPage';
import Config from './pages/config/Config';
import MankaDetailPage from './pages/detail/MankaDetailPage';
import FavoriteList from './pages/list/FavoriteList';
import MankaListPage from './pages/list/MankaListPage';
import Login from './pages/login/Login';
import { ConfirmProvider } from 'material-ui-confirm';
import { SnackbarProvider } from 'notistack';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [open, setOpen] = useState(true);

  return (
    // <ThemeProvider theme={theme}>
    //   <CssBaseline />
    //   <ComicListPage />
    // </ThemeProvider>
    <React.Fragment>
      <ThemeProvider theme={lightTheme}>
      <ConfirmProvider>
      <SnackbarProvider autoHideDuration={3000} maxSnack={3}>
        <BrowserRouter>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">
              Home
            </Link>
            <Link underline="hover" color="inherit" href="/favorite">
              Favorite
            </Link>
            <Link underline="hover" color="inherit" href="/tasks">
              Tasks
            </Link>
            <Link underline="hover" color="inherit" href="/taskLogs">
              TaskLogs
            </Link>
            <Link underline="hover" color="inherit" href="/config">
              Config
            </Link>
          </Breadcrumbs>
          <Routes>
            <Route
              path="/"
              element={
                <AuthWrapComponent>
                  <MankaListPage />
                </AuthWrapComponent>
              }
            />
            <Route
              path="/favorite"
              element={
                <AuthWrapComponent>
                  <FavoriteList />
                </AuthWrapComponent>
              }
            />
            <Route
              path="/tasks"
              element={
                <AuthWrapComponent>
                  <TaskPage />
                </AuthWrapComponent>
              }
            />
            <Route
              path="/taskLogs"
              element={
                <AuthWrapComponent>
                  <TaskLogPage />
                </AuthWrapComponent>
              }
            />
            <Route
              path="/manka/:mankaId"
              element={
                <AuthWrapComponent>
                  <MankaDetailPage />
                </AuthWrapComponent>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route
              path="/config"
              element={
                <AuthWrapComponent>
                  <Config />
                </AuthWrapComponent>
              }
            />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </BrowserRouter>
        </SnackbarProvider>
        </ConfirmProvider>
      </ThemeProvider>
    </React.Fragment>
  );
}

export default App;
