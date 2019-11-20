// To Do : put all preprocessing functions here
import { Image } from '@piximi/types';
// rescaleData(lowerPercentile, upperPercentile, inputData);
// will be called with inputData = labledData
// returns rescaledSet

export const rescaleData = async (
  lowerPercentile: number,
  upperPercentile: number,
  labledData: Image[]
) => {
  // do something
  // old :const testDataSet = await createLabledTensorflowDataSet(testData, categories);

  let rescaledSet: Image[] = [];

  return { rescaledSet };
};

export const resizeData = async (
  paddingOption1: boolean,
  paddingOption2: boolean,
  labledData: Image[]
) => {
  // do something
  let resizedSet: Image[] = [];

  return { resizedSet };
};

export const augmentData = async (
  dataAugmentation: boolean,
  labledData: Image[]
) => {
  // do something
  // old :const testDataSet = await createLabledTensorflowDataSet(testData, categories);
  let augmentedSet: Image[] = [];
  return { augmentedSet };
};
