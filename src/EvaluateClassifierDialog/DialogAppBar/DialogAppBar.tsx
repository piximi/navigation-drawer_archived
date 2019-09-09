import * as React from 'react';
import { ArrowBack, PlayCircleOutline } from '@material-ui/icons';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import classNames from 'classnames';
import { AppBar, IconButton, Toolbar, Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    leftIcon: {
      marginRight: theme.spacing(1)
    },
    button: {},
    grow: {
      flexGrow: 1
    },
    appBar: {
      position: 'relative',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    },
    appBarShift: {},
    appBarShiftLeft: {}
  })
);

export const DialogAppBar = (props: any) => {
  const { closeDialog, evaluate, openedDrawer } = props;

  const classes = useStyles();

  return (
    <AppBar
      className={classNames(classes.appBar, {
        [classes.appBarShift]: openedDrawer,
        [classes.appBarShiftLeft]: openedDrawer
      })}
    >
      <Toolbar>
        <Tooltip title="Close Dialog" placement="bottom">
          <IconButton
            edge="start"
            color="primary"
            onClick={closeDialog}
            aria-label="Close"
            href={''}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>

        <div className={classes.grow} />

        <Tooltip title="Evaluate the model" placement="bottom">
          <IconButton
            className={classes.button}
            onClick={evaluate}
            href={''}
            size={'medium'}
          >
            <PlayCircleOutline />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};
