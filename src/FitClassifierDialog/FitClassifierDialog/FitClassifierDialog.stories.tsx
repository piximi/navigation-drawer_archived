import React from 'react';
import { storiesOf } from '@storybook/react';
import { FitClassifierDialog } from './FitClassifierDialog';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';
import { Category, Image, Partition, Classifier } from '@piximi/types';

const closeDialog = () => {};

const theme = createMuiTheme({
  palette: {
    type: 'light'
  }
});

import * as testFile from 'C:\\Users\\m_lev\\Downloads\\mnist.json';

storiesOf('FitClassifierDialog', module).add('large MNIST', () => (
  <ThemeProvider theme={theme}>
    <FitClassifierDialog
      categories={testFile.default.categories}
      closeDialog={closeDialog}
      images={testFile.default.images}
      openedDialog
      openedDrawer={false}
      setImagesPartition={() => {}}
      datasetInitialized={true}
      setDatasetInitialized={partitions => {}}
    />
  </ThemeProvider>
));
