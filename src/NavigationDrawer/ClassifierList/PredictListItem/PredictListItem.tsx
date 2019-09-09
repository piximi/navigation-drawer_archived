import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import * as React from 'react';
import LabelImportantIcon from '@material-ui/icons/LabelImportant';
import { useTranslation } from 'react-i18next';
import { Category, Image } from '@piximi/types';
import { createPredictionSet } from '../../../FitClassifierDialog/FitClassifierDialog/dataset';
import * as tensorflow from '@tensorflow/tfjs';

type PredictListItemProbs = {
  categories: Category[];
  images: Image[];
};

export const PredictListItem = (probs: PredictListItemProbs) => {
  const { categories, images } = probs;

  const { t: translation } = useTranslation();

  const predict = async () => {
    const model = await tensorflow.loadLayersModel('indexeddb://mobilenet');

    const predictionSet = await createPredictionSet(images);

    var predictions: any = [];
    for (let i: number = 0; i < predictionSet.lables.length; i++) {
      var prediction = model.predict(predictionSet.data[i]);
      predictions.push(prediction);
      debugger;
    }
  };

  return (
    <React.Fragment>
      <ListItem button dense onClick={predict}>
        <ListItemIcon>
          <LabelImportantIcon />
        </ListItemIcon>

        <ListItemText primary={translation('Predict')} />
      </ListItem>
    </React.Fragment>
  );
};
