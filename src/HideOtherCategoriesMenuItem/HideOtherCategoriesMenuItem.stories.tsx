import React from 'react';
import { storiesOf } from '@storybook/react';
import { HideOtherCategoriesMenuItem } from './HideOtherCategoriesMenuItem';
import { Category } from '@piximi/types';

const category: Category = {
  description: 'example',
  identifier: '11111111-1111-1111-1111-11111111111',
  index: 1,
  visualization: {
    color: '#F44336',
    visible: true
  }
};

const updateColor = (identifier: string, color: string) => {};

const updateDescription = (identifier: string, description: string) => {};

const onClose = () => {};

storiesOf('HideOtherCategoriesMenuItem', module).add('example', () => (
  <HideOtherCategoriesMenuItem
    category={category}
    updateColor={updateColor}
    updateDescription={updateDescription}
    onClose={onClose}
    open
  />
));
