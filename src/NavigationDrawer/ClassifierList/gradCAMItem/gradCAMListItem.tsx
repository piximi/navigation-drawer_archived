import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import * as React from 'react';
import LabelImportantIcon from '@material-ui/icons/LabelImportant';
import { useTranslation } from 'react-i18next';
import { Category, Image, Score } from '@piximi/types';
import { gradClassActivationMap } from '../../../gradCAM/grad-CAM';
import * as tensorflow from '@tensorflow/tfjs';
//import { hash } from 'string-hash';
var hash = require('string-hash');

type imageProps = {
  checksum: string;
  data: string;
};

type PredictListItemProbs = {
  createImages: (imagePropsArray: imageProps[]) => void;
  categories: Category[];
  images: Image[];
};

//let canvasRef = React.useRef();

var imageH: number;
var imageW: number;

export const gradCAMListItem = (probs: PredictListItemProbs) => {
  const { createImages, categories, images } = probs;

  const { t: translation } = useTranslation();

  const writeImageTensorToFile = async (
    imageTensor: tensorflow.Tensor<tensorflow.Rank>
  ) => {
    imageH = imageTensor.shape[1] as number;
    imageW = imageTensor.shape[2] as number;
    const imageData = imageTensor.dataSync();
    debugger;
    const bufferLen = imageH * imageW * 4;
    const buffer = new Uint8Array(bufferLen);
    let index = 0;
    for (let i = 0; i < imageH; ++i) {
      for (let j = 0; j < imageW; ++j) {
        const inIndex = 3 * (i * imageW + j);
        buffer.set([Math.floor(imageData[inIndex])], index++);
        buffer.set([Math.floor(imageData[inIndex + 1])], index++);
        buffer.set([Math.floor(imageData[inIndex + 2])], index++);
        buffer.set([255], index++);
      }
    }

    const image = uint8ToImageData(buffer, imageW, imageH);
    // not working!!
    var imageProps: imageProps[] = [];
    //var data = new TextDecoder("utf-8").encoding(image.data);

    //var data =  "data:image/png;base64,"+ btoa(String.fromCharCode.apply(null, buffer));

    // var blob = new Blob([buffer], {'type': 'image/png'});
    // var data = URL.createObjectURL(blob);

    // const checksum = String(hash(data));
    // imageProps.push({ checksum, data});
    // debugger;
    // createImages(imageProps);
    //const canvas = canvasRef.current;
    // @ts-ignore
    const ctx = canvas.getContext('2d');
    // @ts-ignore
    canvas.height = imageH;
    // @ts-ignore
    canvas.width = imageW;

    ctx.putImageData(buffer, 0, 0);

    // // @ts-ignore
    // context.drawImage(buffer, 0, 0, canvas.width, canvas.height);

    // imageData2Blob(image)
    // .then(function(blob) { out.src = URL.createObjectURL(blob); });
  };

  const imageData2Blob = (image: ImageData) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    // @ts-ignore
    canvas.getContext('2d').putImageData(image, 0, 0);
    return new Promise(res => canvas.toBlob(res));
  };

  const uint8ToImageData = (
    uint8: Uint8Array,
    width: number,
    height: number
  ) => {
    // @ts-ignore
    var iData = document
      .createElement('canvas')
      .getContext('2d')
      .createImageData(width, height);
    for (var i = 0; i < iData.data.length; i++) {
      iData.data[i] = uint8[i];
    }
    return iData;
  };

  const computeGradCAM = async () => {
    const model = await tensorflow.loadLayersModel('indexeddb://mobilenet');
    var test = await gradClassActivationMap(model, 1, images[0]);

    writeImageTensorToFile(test);
  };

  // <div>
  //       <canvas
  //         type={'selectableElement'}
  //         style={{ verticalAlign: 'middle', padding: '2px' }}
  //         // @ts-ignore
  //         ref={canvasRef}
  //         height={imageH}
  //         width={imageW}
  //         zIndex={1400}
  //       />
  //       {/* <img
  //         onLoad={onLoad}
  //         alt="foo"
  //         src={src}
  //         style={{ visibility: 'hidden' }}
  //       /> */}
  //     </div>

  return (
    <React.Fragment>
      <ListItem button dense onClick={computeGradCAM}>
        <ListItemIcon>
          <LabelImportantIcon />
        </ListItemIcon>

        <ListItemText primary={translation('Grad-CAM')} />
      </ListItem>
      {/* 
      <div>
        <canvas
          style={{ verticalAlign: 'middle', padding: '2px' }}
          // @ts-ignore
          ref={ctx}
          height={imageH}
          width={imageW}
        />
        {/* <img
          onLoad={onLoad}
          alt="foo"
          src={src}
          style={{ visibility: 'hidden' }}
        /> */}
      {/* </div> */} */}
    </React.Fragment>
  );
};
