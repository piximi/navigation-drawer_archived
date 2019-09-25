import { connect } from 'react-redux';
import { Classifier, Score, Image, Partition } from '@piximi/types';
import { gradCAMListItem } from './gradCAMListItem';
import { createImagesAction } from '@piximi/store';
import { Dispatch } from 'redux';
import * as uuid from 'uuid';

type State = {
  classifier: Classifier;
};

type imageProps = {
  checksum: string;
  data: string;
};

const mapStateToProps = (state: State) => {
  return {
    categories: state.classifier.categories,
    classifier: state.classifier,
    images: state.classifier.images
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    createImages: (imagePropsArray: imageProps[]) => {
      const images: Image[] = imagePropsArray.map((imageProps: imageProps) => {
        const image: Image = {
          categoryIdentifier: '00000000-0000-0000-0000-000000000000',
          checksum: imageProps.checksum,
          data: imageProps.data,
          identifier: uuid.v4(),
          partition: Partition.Training,
          scores: [],
          visualization: {
            brightness: 0,
            contrast: 0,
            visible: true,
            visibleChannels: []
          }
        };
        return image;
      });

      const payload = {
        images: images
      };

      const action = createImagesAction(payload);

      dispatch(action);
    }
  };
};

export const ConnectedGradCAMListItem = connect(
  mapStateToProps,
  mapDispatchToProps
)(gradCAMListItem);
