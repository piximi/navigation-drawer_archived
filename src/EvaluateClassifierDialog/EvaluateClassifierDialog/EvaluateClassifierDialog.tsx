import { Dialog, DialogContent, DialogContentText } from '@material-ui/core';
import * as React from 'react';
import { DialogAppBar } from '../DialogAppBar';
import { DialogTransition } from '../DialogTransition';
import classNames from 'classnames';
import { Form } from '../Form/Form';
import { makeStyles } from '@material-ui/styles';
import { Category, Image } from '@piximi/types';
import * as tensorflow from '@tensorflow/tfjs';
import { useState } from 'react';
import { styles } from './EvaluateClassifierDialog.css';
//import { createTestSet } from '@piximi/models';
import { createTestSet } from '../../FitClassifierDialog/FitClassifierDialog/dataset';

const lossFunctions = {
  absoluteDifference: 'Absolute difference',
  cosineDistance: 'Cosine distance',
  hingeLoss: 'Hinge',
  huberLoss: 'Huber',
  logLoss: 'Log',
  meanSquaredError: 'Mean squared error (MSE)',
  sigmoidCrossEntropy: 'Sigmoid cross entropy',
  softmaxCrossEntropy: 'Softmax cross entropy',
  categoricalCrossentropy: 'Categorical cross entropy'
};

const optimizationAlgorithms: { [identifier: string]: any } = {
  adadelta: tensorflow.train.adadelta,
  adam: tensorflow.train.adam,
  adamax: tensorflow.train.adamax,
  rmsprop: tensorflow.train.rmsprop,
  sgd: tensorflow.train.sgd
};

const useStyles = makeStyles(styles);

type EvaluateClassifierDialogProps = {
  categories: Category[];
  closeDialog: () => void;
  images: Image[];
  openedDialog: boolean;
  openedDrawer: boolean;
};

export const EvaluateClassifierDialog = (
  props: EvaluateClassifierDialogProps
) => {
  const { categories, closeDialog, images, openedDialog, openedDrawer } = props;

  const styles = useStyles({});
  const [useCrossValidation, setUseCrossValidation] = useState<boolean>(false);

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

    const testSet = await createTestSet(categories, images);

    const model = await tensorflow.loadLayersModel('indexeddb://mobilenet');

    model.compile({
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
      optimizer: tensorflow.train.adam()
    });

    const x = tensorflow.tidy(() => tensorflow.concat(testSet.data));
    const y = tensorflow.tidy(() =>
      tensorflow.oneHot(testSet.lables, numberOfClasses)
    );

    const evaluation = (await model.evaluate(x, y)) as tensorflow.Scalar[];
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
      />

      <DialogContent>
        <Form
          useCrossValidation={useCrossValidation}
          onUseCrossValidationChange={onUseCrossValidationChange}
        />
      </DialogContent>
    </Dialog>
  );
};
