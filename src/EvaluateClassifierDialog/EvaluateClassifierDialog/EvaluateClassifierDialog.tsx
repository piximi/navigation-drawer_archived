import { Dialog, DialogContent, DialogContentText } from '@material-ui/core';
import * as React from 'react';
import { DialogAppBar } from '../DialogAppBar';
import { DialogTransition } from '../DialogTransition';
import classNames from 'classnames';
import { MetricsTable } from '../MetricsTable/MetricsTable';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Category, Image, Score } from '@piximi/types';
import * as tensorflow from '@tensorflow/tfjs';
import { useState } from 'react';
import { styles } from './EvaluateClassifierDialog.css';
//import { createTestSet } from '@piximi/models';
import {
  createTestSet,
  createTestSetCV
} from '../../FitClassifierDialog/FitClassifierDialog/dataset';
import * as tfvis from '@tensorflow/tfjs-vis';
import {
  evaluateTensorflowModel,
  evaluateTensorflowModelCV
} from './modelEvaluater';

const useStyles = makeStyles(styles);

type EvaluateClassifierDialogProps = {
  categories: Category[];
  closeDialog: () => void;
  images: Image[];
  openedDialog: boolean;
  openedDrawer: boolean;
};

const getMatrixFromArray = (array: any, size: number): number[][] => {
  var matrix: number[][] = [];
  return matrix;
};

export const EvaluateClassifierDialog = (
  props: EvaluateClassifierDialogProps
) => {
  const { categories, closeDialog, images, openedDialog, openedDrawer } = props;

  const styles = useStyles({});
  const [useCrossValidation, setUseCrossValidation] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [crossEntropy, setCrossEntropy] = useState<number>(0);

  const onUseCrossValidationChange = (event: React.FormEvent<EventTarget>) => {
    setUseCrossValidation(!useCrossValidation);
  };

  const className = classNames(styles.content, styles.contentLeft, {
    [styles.contentShift]: openedDrawer,
    [styles.contentShiftLeft]: openedDrawer
  });

  const classes = {
    paper: styles.paper
  };

  const evaluate = async () => {
    const numberOfClasses: number = categories.length - 1;
    const model = await tensorflow.loadLayersModel('indexeddb://mobilenet');

    var modelEvaluationResults;
    if (useCrossValidation) {
      var evaluationSet = await createTestSetCV(categories, images);
      modelEvaluationResults = await evaluateTensorflowModelCV(
        model,
        evaluationSet.data,
        evaluationSet.lables,
        numberOfClasses
      );
    } else {
      var evaluationSet = await createTestSet(categories, images);
      modelEvaluationResults = evaluateTensorflowModel(
        model,
        evaluationSet.data,
        evaluationSet.lables,
        numberOfClasses
      );
    }

    var accuracy = modelEvaluationResults.accuracy;
    setAccuracy(accuracy);
    var crossEntropy = modelEvaluationResults.crossEntropy;
    setCrossEntropy(crossEntropy);
    var confusionMatrixArray = modelEvaluationResults.confusionMatrixArray;

    var values = [];
    for (let i = 0; i < numberOfClasses; i++) {
      const row = [];
      for (let j = 0; j < numberOfClasses; j++) {
        // @ts-ignore
        row.push(confusionMatrixArray[i + j]);
      }
      values.push(row);
    }
    const lableCategories = categories.filter((category: Category) => {
      return category.identifier !== '00000000-0000-0000-0000-000000000000';
    });
    const lables = lableCategories.map((category: Category) => {
      return category.identifier;
    });
    const data = { values, lables };

    const surface = tfvis.visor().surface({ name: 'Confusion Matrix' });
    tfvis.render.confusionMatrix(surface, data);
  };

  const onEvaluate = async () => {
    await evaluate().then(() => {});
  };

  return (
    <Dialog
      className={className}
      classes={classes}
      disableBackdropClick
      disableEscapeKeyDown
      fullScreen
      onClose={closeDialog}
      open={openedDialog}
      TransitionComponent={DialogTransition}
      style={{ zIndex: 1203 }}
    >
      <DialogAppBar
        closeDialog={closeDialog}
        evaluate={onEvaluate}
        openedDrawer={openedDrawer}
        useCrossValidation={useCrossValidation}
        onUseCrossValidationChange={onUseCrossValidationChange}
      />

      {/* <MetricsTable
        accuracy={accuracy}
        crossEntropy={crossEntropy}
      /> */}
      <div>
        <Grid container spacing={3}>
          <Grid>
            <Paper>bla={accuracy}</Paper>
          </Grid>
        </Grid>
      </div>

      <DialogContent>
        <div id="tfjs-visor-container"></div>
      </DialogContent>
    </Dialog>
  );
};
