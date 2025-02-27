import {
  Backdrop,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import API from '../../middleware/api';
import type { PageTask, Task } from '../../types';
import type { TableColumn } from '../../types/func';
import type { Response } from '../../types/response';
import { formatLocalTime } from '../../utils/datetime';
import httpClient from '@/adapter/http/client';

export default function TaskPage() {
  const [pageData, setPageData] = React.useState<Task[]>([]);
  const [pageTotal, setPageTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [searchKey, setSearchKey] = React.useState('');
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    loadPage();
    // eslint-disable-next-line66
  }, [page, searchKey, rowsPerPage]);

  const loadPage = async () => {
    console.log('loadPage');
    //todo
    setLoading(true);
    const query = {
      page: {
        pageNo: page + 1,
        pageSize: rowsPerPage,
      },
    };
    try {
      // const {
      //   data: { data },
      // } = await API.post<Response<PageTask>>('/task/page', query);
      const { data } = await httpClient.post<PageTask>('/task/page', query);
      const { pageData = [], pageTotal = 0 } = data;
      setPageData(pageData);
      setPageTotal(pageTotal);
    } catch (e) {
      console.error(e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn[] = [
    {
      id: 'id',
      label: '标识',
      style: { minWidth: 50, wordBreak: 'break-all' },
      align: 'center',
    },
    {
      id: 'taskId',
      label: '任务标识',
      style: { minWidth: 150 },
      align: 'center',
    },
    {
      id: 'taskName',
      label: '任务名称',
      style: { minWidth: 150 },
      align: 'center',
    },
    {
      id: 'taskType',
      label: '任务类型',
      style: { minWidth: 80 },
      align: 'center',
    },
    {
      id: 'taskRunType',
      label: '任务运行类型',
      style: { minWidth: 80 },
      align: 'center',
    },
    {
      id: 'disabled',
      label: '启用/禁用',
      style: { minWidth: 80 },
      align: 'center',
      format: (value, row) => {
        return value ? '禁用' : '启用';
      },
    },
    {
      id: 'createdAt',
      label: '新建于',
      style: { minWidth: 150 },
      align: 'center',
      format: (value, data) => {
        return formatLocalTime(value);
      },
    },
    {
      id: 'updatedAt',
      label: '更新于',
      style: { minWidth: 150 },
      align: 'center',
      format: (value, data) => {
        return formatLocalTime(value);
      },
    },
  ];

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
  };

  const submitScanTask = async (offsetDays?: number) => {
    try {
      let body = {};
      if (offsetDays && offsetDays > 0) {
        body = {
          props: {
            scanFileStartTime: dayjs().subtract(offsetDays, 'day').valueOf(),
            scanFileEndTime: dayjs().add(1, 'day').valueOf(),
          },
        };
      }
      // await API.post<Response<PageTask>>('/task/trigger/scan', body);
      await httpClient.post<PageTask>('/task/trigger/scan', body);
    } catch (e) {
      console.error(e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    } finally {
    }
  };

  // @ts-ignore
  return (
    <>
      <Container>
        {/*<Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}*/}
        {/*          open={loading}>*/}
        {/*    <CircularProgress/>*/}
        {/*</Backdrop>*/}

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              '& > *': {
                m: 1,
              },
            }}
          >
            <ButtonGroup variant="text" aria-label="text button group">
              <Button onClick={async () => submitScanTask()}>
                发起全量扫描任务
              </Button>
              <Button onClick={async () => submitScanTask(1)}>
                发起增量扫描任务(1天)
              </Button>
              <Button onClick={async () => submitScanTask(3)}>
                发起增量扫描任务(3天)
              </Button>
              <Button onClick={async () => submitScanTask(7)}>
                发起增量扫描任务(7天)
              </Button>
            </ButtonGroup>
          </Box>
        </Paper>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ ...column.style }}
                      {...column.cellProps}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pageData.map((row, index) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns.map((column) => {
                        // @ts-ignore
                        const value = row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ ...column.style }}
                            {...column.cellProps}
                          >
                            {column.format ? column.format(value, row) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={pageTotal}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Container>
    </>
  );
}
