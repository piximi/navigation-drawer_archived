import { Dialog, DialogContent, DialogContentText } from '@material-ui/core';
import * as React from 'react';
import { DialogAppBar } from '../DialogAppBar';
import { DialogTransition } from '../DialogTransition';
import { Form } from '../Form/Form';
import { History } from '../History';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/styles';
import { Category, Image } from '@piximi/types';
import * as tensorflow from '@tensorflow/tfjs';
import { useState } from 'react';
import { styles } from './FitClassifierDialog.css';
import { createMobilenet } from '@piximi/models';
import { createTrainingSet } from './dataset';
import { updateImagesPartitionAction } from '@piximi/store';

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

type LossHistory = { x: number; y: number }[];

type FitClassifierDialogProps = {
  categories: Category[];
  closeDialog: () => void;
  images: Image[];
  openedDialog: boolean;
  openedDrawer: boolean;
};

const TESTSET_RATIO = 0.2;

const assignToSet = (): number => {
  const rdn = Math.random();
  if (rdn < TESTSET_RATIO) {
    return 2;
  } else {
    return 0;
  }
};

// assign each image to train- test- or validation- set
export const initializeDatasets = (images: Image[]) => {
  console.log('initialize dataset');
  var partitions: number[] = [];
  images.forEach((image: Image) => {
    const setItentifier = assignToSet();
    partitions.push(setItentifier);
  });
  updateImagesPartitionAction(partitions);
};

export const FitClassifierDialog = (props: FitClassifierDialogProps) => {
  const { categories, closeDialog, images, openedDialog, openedDrawer } = props;

  const styles = useStyles({});

  const [stopTraining, setStopTraining] = useState<boolean>(false);
  const [datasetInitialized, setDatasetInitialized] = useState<boolean>(false);
  const [batchSize, setBatchSize] = useState<number>(32);
  const [epochs, setEpochs] = useState<number>(10);
  const [optimizationAlgorithm, setOptimizationAlgorithm] = useState<string>(
    'adam'
  );
  const [learningRate, setLearningRate] = useState<number>(0.01);
  const [lossFunction, setLossFunction] = useState<string>(
    'categoricalCrossentropy'
  );
  const [inputShape, setInputShape] = useState<string>('224, 224, 3');
  const [trainingLossHistory, setTrainingLossHistory] = useState<LossHistory>([
    { x: 0, y: 0 }
  ]);

  const [trainingAccuracyHistory, setTrainingAccuracyHistory] = useState<
    number[]
  >([]);

  const onBatchSizeChange = (event: React.FormEvent<EventTarget>) => {
    const target = event.target as HTMLInputElement;
    var value = Number(target.value);

    setBatchSize(value);
  };

  const onEpochsChange = (event: React.FormEvent<EventTarget>) => {
    const target = event.target as HTMLInputElement;
    var value = Number(target.value);

    setEpochs(value);
  };

  const onStopTrainingChange = () => {
    setStopTraining(true);
  };

  const resetStopTraining = async () => {
    setStopTraining(false);
  };

  const onInputShapeChange = (event: React.FormEvent<EventTarget>) => {
    const target = event.target as HTMLInputElement;

    setInputShape(target.value);
  };

  const onLearningRateChange = (event: React.FormEvent<EventTarget>) => {
    const target = event.target as HTMLInputElement;
    var value = Number(target.value);

    setLearningRate(value);
  };

  const onLossFunctionChange = (event: React.FormEvent<EventTarget>) => {
    const target = event.target as HTMLInputElement;

    setLossFunction(target.value);
  };

  const onOptimizationAlgorithmChange = (
    event: React.FormEvent<EventTarget>
  ) => {
    const target = event.target as HTMLInputElement;

    setOptimizationAlgorithm(target.value);
  };

  const className = classNames(styles.content, styles.contentLeft, {
    [styles.contentShift]: openedDrawer,
    [styles.contentShiftLeft]: openedDrawer
  });

  const classes = {
    paper: styles.paper
  };

  const fit = async () => {
    const numberOfClasses: number = categories.length - 1;
    if (numberOfClasses === 1) {
      alert('The classifier must have at least two classes!');
      return;
    }

    const model = await createMobilenet(
      numberOfClasses,
      100,
      lossFunction,
      ['accuracy'],
      tensorflow.train.adam(learningRate)
    );

    const trainingSet = await createTrainingSet(categories, images);

    const x = trainingSet.data;
    const y = trainingSet.lables;

    const args = {
      batchSize: batchSize,
      epochs: epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: async (
          epoch: number,
          logs?: tensorflow.Logs | undefined
        ) => {
          if (logs) {
            console.log(
              `onEpochEnd ${epoch}, loss: ${logs.loss}, accuracy: ${logs.accuracy}`
            );
          }
          if (stopTraining) {
            console.log('test train stop');
            model.stopTraining = true;
          }
        }
      }
    };

    const history = await model.fit(x, y, args);

    await model.save('indexeddb://mobilenet');
  };

  const onFit = async () => {
    if (!datasetInitialized) {
      initializeDatasets(images);
      setDatasetInitialized(true);
    }
    await resetStopTraining();
    await fit().then(() => {});
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
        onStopTrainingChange={onStopTrainingChange}
        closeDialog={closeDialog}
        fit={onFit}
        openedDrawer={openedDrawer}
      />

      <DialogContent>
        <DialogContentText>Classifier Settings:</DialogContentText>

        <Form
          batchSize={batchSize}
          closeDialog={closeDialog}
          epochs={epochs}
          inputShape={inputShape}
          learningRate={learningRate}
          lossFunction={lossFunction}
          onBatchSizeChange={onBatchSizeChange}
          onEpochsChange={onEpochsChange}
          onInputShapeChange={onInputShapeChange}
          onLearningRateChange={onLearningRateChange}
          onLossFunctionChange={onLossFunctionChange}
          onOptimizationAlgorithmChange={onOptimizationAlgorithmChange}
          openedDialog={openedDialog}
          optimizationAlgorithm={optimizationAlgorithm}
        />

        <DialogContentText>Training history:</DialogContentText>

        <History data={trainingLossHistory} />
      </DialogContent>
    </Dialog>
  );
};
