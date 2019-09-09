import * as React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Grid, Switch, FormControlLabel } from '@material-ui/core';
import * as _ from 'lodash';
import * as tensorflow from '@tensorflow/tfjs';

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    expansionPanel: {
      boxShadow: 'none'
    },
    leftIcon: {
      marginRight: theme.spacing(1)
    },
    rightIcon: {
      marginLeft: theme.spacing(1)
    },
    button: {
      marginRight: theme.spacing(1)
    },
    grow: {
      flexGrow: 1
    },
    form: {},
    appBar: {
      position: 'relative',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    },
    container: {
      // width: '100%',
      display: 'flex',
      flexWrap: 'wrap'
    },
    root: {
      zIndex: 1100
    },
    paper: {
      zIndex: 1100
    },
    paperFullScreen: {
      left: '280px'
    },
    menu: {
      // width: 200,
    },
    textField: {
      // marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      flexBasis: 300,
      width: '100%'
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular
    }
  })
);

type FormProps = {
  useCrossValidation: boolean;
  onUseCrossValidationChange: (event: React.FormEvent<EventTarget>) => void;
};

export const Form = (props: FormProps) => {
  const { useCrossValidation, onUseCrossValidationChange } = props;

  const classes = useStyles();

  return (
    <form className={classes.container} noValidate autoComplete="off">
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <FormControlLabel
            control={
              <Switch
                checked={useCrossValidation}
                onChange={onUseCrossValidationChange}
              />
            }
            label="use cross validation"
          />
        </Grid>
      </Grid>
    </form>
  );
};
