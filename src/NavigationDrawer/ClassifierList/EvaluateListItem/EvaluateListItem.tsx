import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import * as React from 'react';
import BarChartIcon from '@material-ui/icons/BarChart';
import { useTranslation } from 'react-i18next';
import { useDialog } from '@piximi/hooks';
import { Category, Image } from '@piximi/types';
import { EvaluateClassifierDialog } from '../../../EvaluateClassifierDialog/EvaluateClassifierDialog';

type EvaluateListItemProbs = {
  categories: Category[];
  images: Image[];
};

export const EvaluateListItem = (probs: EvaluateListItemProbs) => {
  const { categories, images } = probs;

  const { openedDialog, openDialog, closeDialog } = useDialog();

  const { t: translation } = useTranslation();

  const evaluate = async () => {
    openDialog();
  };

  return (
    <React.Fragment>
      <ListItem button dense onClick={evaluate}>
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>

        <ListItemText primary={translation('Evaluate')} />
      </ListItem>

      <EvaluateClassifierDialog
        categories={categories}
        closeDialog={closeDialog}
        images={images}
        openedDialog={openedDialog}
        openedDrawer={true}
      />
    </React.Fragment>
  );
};
