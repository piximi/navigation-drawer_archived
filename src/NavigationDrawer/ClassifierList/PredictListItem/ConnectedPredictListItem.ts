import { connect } from 'react-redux';
import { Classifier } from '@piximi/types';
import { PredictListItem } from './PredictListItem';

type State = {
  classifier: Classifier;
};

const mapStateToProps = (state: State) => {
  return {
    categories: state.classifier.categories,
    classifier: state.classifier,
    images: state.classifier.images
  };
};

export const ConnectedPredictListItem = connect(mapStateToProps)(
  PredictListItem
);
