import { ConfirmProvider } from 'material-ui-confirm';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <ConfirmProvider>
    <SnackbarProvider autoHideDuration={3000} maxSnack={3}>
      <App />
    </SnackbarProvider>
  </ConfirmProvider>,
);
