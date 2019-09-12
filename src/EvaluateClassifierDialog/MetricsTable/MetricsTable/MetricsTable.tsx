import * as React from 'react';
import {
  withStyles,
  Theme,
  createStyles,
  makeStyles
} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white
    },
    body: {
      fontSize: 16
    }
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.background.default
      }
    }
  })
)(TableRow);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(5),
      overflowX: 'auto'
    },
    table: {
      minWidth: 100
    }
  })
);

type MetricsTableProps = {
  accuracy: number;
  crossEntropy: number;
};

export const MetricsTable = (props: MetricsTableProps) => {
  const { accuracy, crossEntropy } = props;

  function createData(Metric: string, Value: number) {
    return { Metric, Value };
  }

  const rows = [
    createData('Accuracy', accuracy),
    createData('Cross Entropy', crossEntropy)
  ];

  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <StyledTableCell>Metrics</StyledTableCell>
            <StyledTableCell align="left">Values</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <StyledTableRow key={row.Metric}>
              <StyledTableCell component="th" scope="row">
                {row.Metric}
              </StyledTableCell>
              <StyledTableCell align="right">{row.Value}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};
