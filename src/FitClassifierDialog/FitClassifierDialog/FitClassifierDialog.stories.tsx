import React from 'react';
import { storiesOf } from '@storybook/react';
import { FitClassifierDialog } from './FitClassifierDialog';
import { Provider } from 'react-redux';
import { store } from '@piximi/store';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';

const closeDialog = () => {};

const theme = createMuiTheme({
  palette: {
    type: 'light'
  }
});

storiesOf('FitClassifierDialog', module).add('example', () => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <FitClassifierDialog
        categories={[]}
        closeDialog={closeDialog}
        images={[]}
        openedDialog
        openedDrawer={false}
      />
    </ThemeProvider>
  </Provider>
));
