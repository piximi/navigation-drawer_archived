import {
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import * as React from 'react';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useCollapseList } from '@piximi/hooks';
import { ConnectedFitListItem } from '../FitListItem/ConnectedFitListItem';
import { ConnectedEvaluateListItem } from '../EvaluateListItem/ConnectedEvaluateListItem';
import { ConnectedPredictListItem } from '../PredictListItem/ConnectedPredictListItem';

export const ClassifierList = () => {
  const { collapsedList, collapseList } = useCollapseList();

  return (
    <List dense>
      <ListItem button onClick={collapseList}>
        <ListItemIcon>
          {!collapsedList ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemIcon>

        <ListItemText primary="Classifier" />
      </ListItem>

      <Collapse in={!collapsedList} timeout="auto" unmountOnExit>
        <ConnectedFitListItem />

        <ConnectedEvaluateListItem />

        <ConnectedPredictListItem />
      </Collapse>
    </List>
  );
};
