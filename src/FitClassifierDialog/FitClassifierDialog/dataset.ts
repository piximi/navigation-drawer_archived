import { Category, Image } from '@piximi/types';
import * as ImageJS from 'image-js';
import * as tensorflow from '@tensorflow/tfjs';

const ia = require('image-augment')(tensorflow);

export const createTrainingSet = async (
  categories: Category[],
  labledData: Image[],
  numberOfClasses: number,
  useRandomAug: boolean
) => {
  const trainingData: Image[] = [];
  for (let i = 0; i < labledData.length; i++) {
    if (labledData[i].partition === 0) {
      trainingData.push(labledData[i]);
    }
  }

  const trainDataSet = await createLabledTensorflowDataSet(
    trainingData,
    categories,
    useRandomAug
  );

  let concatenatedTensorData = tensorflow.tidy(() =>
    tensorflow.concat(trainDataSet.data)
  );
  let concatenatedLableData = tensorflow.tidy(() =>
    tensorflow.oneHot(trainDataSet.lables, numberOfClasses)
  );

  trainDataSet.data.forEach((tensor: tensorflow.Tensor<tensorflow.Rank>) =>
    tensor.dispose()
  );

  return { data: concatenatedTensorData, lables: concatenatedLableData };
};

export const createAutotunerDataSet = async (
  categories: Category[],
  labledData: Image[]
) => {
  const trainingData: Image[] = [];
  for (let i = 0; i < labledData.length; i++) {
    if (labledData[i].partition === 0) {
      trainingData.push(labledData[i]);
    }
  }

  const trainDataSet = await createLabledTensorflowDataSet(
    trainingData,
    categories,
    false
  );

  var datapoints: {
    data: tensorflow.Tensor<tensorflow.Rank>;
    lables: number;
  }[] = [];
  for (let i = 0; i < trainDataSet.lables.length; i++) {
    datapoints.push({
      data: trainDataSet.data[i],
      lables: trainDataSet.lables[i]
    });
  }

  return datapoints;
};

export const createTestSet = async (
  categories: Category[],
  images: Image[]
) => {
  const labledData = images.filter((image: Image) => {
    return image.categoryIdentifier !== '00000000-0000-0000-0000-000000000000';
  });

  const testData: Image[] = [];
  for (let i = 0; i < labledData.length; i++) {
    if (labledData[i].partition === 2) {
      testData.push(labledData[i]);
    }
  }

  const testDataSet = await createLabledTensorflowDataSet(
    testData,
    categories,
    false
  );

  return { data: testDataSet.data, lables: testDataSet.lables };
};

export const createPredictionSet = async (images: Image[]) => {
  const predictionImageSet = images.filter(
    (image: Image) =>
      image.categoryIdentifier === '00000000-0000-0000-0000-000000000000'
  );

  const predictionTensorSet: tensorflow.Tensor<tensorflow.Rank>[] = [];
  const imageIdentifiers: string[] = [];

  for (const image of predictionImageSet) {
    predictionTensorSet.push(await tensorImageTypeData(image, false));
    imageIdentifiers.push(image.identifier);
  }
  return { data: predictionTensorSet, identifiers: imageIdentifiers };
};

var TESTSET_RATIO = 0.2;

export const assignToSet = (): number => {
  const rdn = Math.random();
  if (rdn < TESTSET_RATIO) {
    return 2;
  } else {
    return 0;
  }
};

export const setTestsetRatio = (testsetRatio: number) => {
  TESTSET_RATIO = testsetRatio;
};

const createLabledTensorflowDataSet = async (
  labledData: Image[],
  categories: Category[],
  useRandomAug: boolean
) => {
  let tensorData: tensorflow.Tensor<tensorflow.Rank>[] = [];
  let tensorLables: number[] = [];

  for (const image of labledData) {
    tensorData.push(await tensorImageTypeData(image, useRandomAug));
    tensorLables.push(findCategoryIndex(categories, image.categoryIdentifier));
  }

  return { data: tensorData, lables: tensorLables };
};

const imageToSquare = (
  image: HTMLImageElement | HTMLCanvasElement,
  size: number
): HTMLCanvasElement => {
  const dimensions =
    image instanceof HTMLImageElement
      ? { width: image.naturalWidth, height: image.naturalHeight }
      : image;

  const scale = size / Math.max(dimensions.height, dimensions.width);
  const width = scale * dimensions.width;
  const height = scale * dimensions.height;

  const canvas = document.createElement('canvas') as HTMLCanvasElement;

  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  context.drawImage(image, 0, 0, width, height);

  return canvas;
};

const imageResize = async (
  image: HTMLImageElement | HTMLCanvasElement,
  size: number
): Promise<tensorflow.Tensor> => {
  const dimensions =
    image instanceof HTMLImageElement
      ? { width: image.naturalWidth, height: image.naturalHeight }
      : image;

  const scale = size / Math.max(dimensions.height, dimensions.width);
  const width = Math.round(scale * dimensions.width);
  const height = Math.round(scale * dimensions.height);

  const canvas = document.createElement('canvas') as HTMLCanvasElement;

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  context.drawImage(image, 0, 0, width, height);

  // const toCanvas = (image: ImageJS.Image): HTMLCanvasElement => {
  //   return image.getCanvas();
  // }

  // const base64 = toCanvas(image);
  // tensorflow.browser.fromPixels(base64);

  // let imgPromise = new Promise<tensorflow.Tensor>((resolve) => {
  //   const images = tensorflow.zeros([0, 0, 0, 0]);
  //   resolve(images);
  // });

  if (width >= height) {
    const padSize = Math.round(width / 2 - height / 2);
    const basicAugmentation = ia.sequential([
      ia.pad({
        size: [padSize, 0],
        borderType: 'replicate'
      })
    ]);
    // const a = tensorflow.zeros([1, width, height, 1]);
    // return basicAugmentation.read(tensorflow.concat([tensorImg, a], 3));
    return getImgTensor(canvas)
      .then(tensor => {
        const a = tensorflow.zeros([1, canvas.width, canvas.height, 1]);
        return tensorflow.concat([tensor, a], 3); // RBGA
      })
      .then(tensor => {
        return basicAugmentation.read(tensor);
      })
      .then(({ images }) => {
        return tensorflow.slice(images, [0, 0, 0, 0], [1, 224, 224, 3]);
      });
  } else {
    const padSize = Math.round(height / 2 - width / 2);
    // console.log(padSize);
    const basicAugmentation = ia.sequential([
      ia.pad({
        size: [0, padSize],
        borderType: 'replicate'
      })
    ]);
    return getImgTensor(canvas)
      .then(tensor => {
        const a = tensorflow.zeros([1, canvas.width, canvas.height, 1]);
        // console.log(tensor.shape);
        return tensorflow.concat([tensor, a], 3); // RBGA
      })
      .then(tensor => {
        return basicAugmentation.read(tensor);
      })
      .then(({ images }) => {
        // console.log((<tensorflow.Tensor>images).shape);
        return tensorflow.slice(images, [0, 0, 0, 0], [1, 224, 224, 3]);
      });
  }
};

const findCategoryIndex = (
  categories: Category[],
  identifier: string
): number => {
  const lables = categories.filter(
    (category: Category) =>
      category.identifier !== '00000000-0000-0000-0000-000000000000'
  );
  return lables.findIndex(
    (category: Category) => category.identifier === identifier
  );
};

export const imageRotateFlip = async (image: Promise<tensorflow.Tensor>) => {
  let degree: number = 0;
  let random = Math.random();
  let tensor_image: tensorflow.Tensor;

  // hard code

  if (random < 0.25) {
    degree = 0;
  } else if (random < 0.5) {
    degree = 90;
  } else if (random < 0.75) {
    degree = 180;
  } else {
    degree = 270;
  }
  const basicAugmentation = ia.sequential([
    ia.fliplr(0.5),
    ia.flipud(0.5),
    ia.affine({ rotate: degree }),
    ia.resize([224, 224])
  ]);

  return image
    .then(tensor => {
      const a = tensorflow.zeros([1, 224, 224, 1]);
      tensor.print();
      return tensorflow.concat([tensor, a], 3); // RBGA
    })
    .then(tensor => {
      return basicAugmentation.read(tensor);
    })
    .then(({ images }) => {
      return tensorflow.slice(images, [0, 0, 0, 0], [1, 224, 224, 3]);
    });
};

export const tensorImageData = async (image: Image) => {
  const data = await ImageJS.Image.load(image.data);

  return tensorflow.tidy(() => {
    return tensorflow.browser
      .fromPixels(imageToSquare(data.getCanvas(), 224))
      .toFloat()
      .sub(tensorflow.scalar(127.5))
      .div(tensorflow.scalar(127.5))
      .reshape([1, 224, 224, 3]);
  });
};

export const tensorImageTypeData = async (data: Image, isFlipped: boolean) => {
  let imgTensor: tensorflow.Tensor;
  const dataJS = await ImageJS.Image.load(data.data);
  if (isFlipped) {
    imgTensor = await imageRotateFlip(imageResize(dataJS.getCanvas(), 224));
  } else {
    imgTensor = await imageResize(dataJS.getCanvas(), 224);
  }
  return tensorflow.tidy(() => {
    return imgTensor.reshape([1, 224, 224, 3]);
  });
};

export const tensorImageHTMLData = async (
  data: HTMLImageElement | HTMLCanvasElement,
  isFlipped: boolean
) => {
  let imgTensor_R3: tensorflow.Tensor<tensorflow.Rank.R3>;
  let imgTensor: tensorflow.Tensor;
  if (isFlipped) {
    imgTensor = await imageRotateFlip(imageResize(data, 224));
  } else {
    imgTensor = await imageResize(data, 224);
  }
  imgTensor_R3 = imgTensor.reshape([224, 224, 3]);
  return tensorflow.browser.toPixels(imgTensor_R3);
};

export const tensorImageJSData = async (
  data: ImageJS.Image,
  isFlipped: boolean
) => {
  let imgTensor: tensorflow.Tensor;
  if (isFlipped) {
    imgTensor = await imageRotateFlip(imageResize(data.getCanvas(), 224));
  } else {
    imgTensor = await imageResize(data.getCanvas(), 224);
  }
  return tensorflow.tidy(() => {
    return imgTensor.reshape([1, 224, 224, 3]);
  });
};

const getImgTensor = async (data: HTMLImageElement | HTMLCanvasElement) => {
  return tensorflow.tidy(() => {
    return tensorflow.browser
      .fromPixels(data)
      .reshape([1, data.width, data.height, 3]);
  });
};
