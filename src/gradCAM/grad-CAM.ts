/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

/**
 * This script contains a function that performs the following operations:
 *
 * Get visual interpretation of which parts of the image more most
 *    responsible for a convnet's classification decision, using the
 *    gradient-based class activation map (CAM) method.
 *    See function `gradClassActivationMap()`.
 */

import * as tensorflow from '@tensorflow/tfjs';
import { Image } from '@piximi/types';
import { applyColorMap } from './colorMap';
import { tensorImageData } from '../FitClassifierDialog/FitClassifierDialog/dataset';

/**
 * Calculate class activation map (CAM) and overlay it on input image.
 *
 * This function automatically finds the last convolutional layer, get its
 * output (activation) under the input image, weights its filters by the
 * gradient of the class output with respect to them, and then collapses along
 * the filter dimension.
 *
 * @param {tensorflow.Sequential} model A TensorFlow.js sequential model, assumed to
 *   contain at least one convolutional layer.
 * @param {number} classLable Index to class in the model's final classification
 *   output.
 * @param {tensorflow.Tensor4d} inputImage Input image, assumed to have shape
 *   `[1, height, width, 3]`.
 */
export async function gradClassActivationMap(
  model: tensorflow.LayersModel,
  classLable: number,
  inputImage: Image
) {
  const imageTensorData = await tensorImageData(inputImage);

  // Locate the last conv layer of the model
  let lastConvLayerIndex = model.layers.length - 1;
  while (lastConvLayerIndex >= 0) {
    if (model.layers[lastConvLayerIndex].getClassName().startsWith('Conv')) {
      break;
    }
    lastConvLayerIndex--;
  }
  const lastConvLayer = model.layers[lastConvLayerIndex];

  // Create "sub-model 1", which goes from the original input to the output of the last convolutional layer
  const lastConvLayerOutput: tensorflow.SymbolicTensor = lastConvLayer.output as tensorflow.SymbolicTensor;
  const subModel1 = tensorflow.model({
    inputs: model.inputs,
    outputs: lastConvLayerOutput
  });

  // Create "sub-model 2", which goes from the output of the last convolutional layer to the output before the softmax layer
  const subModel2Input: tensorflow.SymbolicTensor = tensorflow.input({
    shape: lastConvLayerOutput.shape.slice(1)
  });
  lastConvLayerIndex++;
  let currentOutput: tensorflow.SymbolicTensor = subModel2Input;
  while (lastConvLayerIndex < model.layers.length) {
    if (
      model.layers[lastConvLayerIndex].getConfig()['activation'] === 'softmax'
    ) {
      break;
    }
    currentOutput = model.layers[lastConvLayerIndex].apply(
      currentOutput
    ) as tensorflow.SymbolicTensor;
    lastConvLayerIndex++;
  }
  const subModel2 = tensorflow.model({
    inputs: subModel2Input,
    outputs: currentOutput
  });

  // Generate the heatMap
  return tensorflow.tidy(() => {
    // run the sub-model 2 and extract the slice of the probability output that corresponds to the desired class
    // @ts-ignore
    const convOutput2ClassOutput = (input: any) =>
      subModel2.apply(input, { training: true }).gather([classLable], 1);

    // This is the gradient function of the output corresponding to the desired class with respect to its input (i.e., the output of the last convolutional layer of the original model)
    const gradFunction = tensorflow.grad(convOutput2ClassOutput);

    // Calculate the values of the last conv layer's output
    const lastConvLayerOutputValues: tensorflow.Tensor<
      tensorflow.Rank
    > = subModel1.apply(imageTensorData) as tensorflow.Tensor<tensorflow.Rank>;

    // Calculate the values of gradients of the class output w.r.t. the output of the last convolutional layer
    const gradValues = gradFunction(lastConvLayerOutputValues);

    // Calculate the weights of the feature maps
    const weights = tensorflow.mean(gradValues, [0, 1, 2]);

    const weightedFeatures = lastConvLayerOutputValues.mul(weights);

    // apply ReLu to the weighted features
    var heatMap: tensorflow.Tensor<tensorflow.Rank> = weightedFeatures.relu();
    debugger;
    // normalize the heat map
    heatMap = heatMap.div(heatMap.max());

    // Up-sample the heat map to the size of the input image
    // @ts-ignore
    heatMap = tensorflow.image.resizeBilinear(heatMap, [
      imageTensorData.shape[1],
      imageTensorData.shape[2]
    ]);
    debugger;
    // Apply an RGB colormap on the heatMap to convert to grey scale heatmap into a RGB one
    var gradCAM = applyColorMap(heatMap);

    // To form the final output, overlay the color heat map on the input image
    gradCAM = gradCAM.mul(10).add(imageTensorData.div(255));
    return gradCAM.div(gradCAM.max()).mul(255);
  });
}
