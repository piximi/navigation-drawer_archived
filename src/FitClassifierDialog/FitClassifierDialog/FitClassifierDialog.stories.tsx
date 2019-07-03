import React from 'react';
import { storiesOf } from '@storybook/react';
import { FitClassifierDialog } from './FitClassifierDialog';

const closeDialog = () => {};

storiesOf('FitClassifierDialog', module).add('example', () => (
  <FitClassifierDialog
    categories={[]}
    closeDialog={closeDialog}
    images={[]}
    openedDialog={true}
    openedDrawer={true}
  />
));
