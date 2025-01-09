import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import GridViewIcon from '@mui/icons-material/GridView';
import ListIcon from '@mui/icons-material/List';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import TextRotateUpIcon from '@mui/icons-material/TextRotateUp';
import TextRotationDownIcon from '@mui/icons-material/TextRotationDown';
import {
  Box,
  ButtonGroup,
  CircularProgress,
  Container,
  ImageList,
  Input,
  MenuItem,
  Pagination,
  Select,
  type SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../middleware/api';
import type {
  MankaArchive,
  MankaArchiveTag,
  PageMankaArchive,
  SearchGroup,
} from '../../types';
import type { Response } from '../../types/response';
import MankaImgItem from './MankaImgItem';
import MankaTableListPage from './MankaTableListPage';
import { DisplayMode, RankField, RankMode } from './types';

// 定义状态和动作类型
interface State {
  searchText: string;
  appliedSearchText: string;
  displayMode: DisplayMode;
  rankMode: RankMode;
  rankField: RankField;
  page: number;
  pageSize: number;
  pageTotal: number;
  loading: boolean;
  pageData: MankaArchive[];
  searchGroups: SearchGroup[];
  searchResultText: string;
}

type Action =
  | { type: 'SET_SEARCH_TEXT'; payload: string }
  | { type: 'SET_APPLIED_SEARCH_TEXT'; payload: string }
  | { type: 'SET_DISPLAY_MODE'; payload: DisplayMode }
  | { type: 'SET_RANK_MODE'; payload: RankMode }
  | { type: 'SET_RANK_FIELD'; payload: RankField }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_PAGE_TOTAL'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PAGE_DATA'; payload: MankaArchive[] }
  | { type: 'SET_SEARCH_GROUPS'; payload: SearchGroup[] }
  | { type: 'SET_SEARCH_RESULT_TEXT'; payload: string };

// 初始化状态
const initialState: State = {
  searchText: '',
  appliedSearchText: '',
  displayMode: DisplayMode.TableList,
  rankMode: RankMode.DESC,
  rankField: RankField.ArchiveUpdatedTime,
  page: 1,
  pageSize: 25,
  pageTotal: 0,
  loading: false,
  pageData: [],
  searchGroups: [],
  searchResultText: '',
};

// Reducer 函数
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SEARCH_TEXT':
      return { ...state, searchText: action.payload };
    case 'SET_APPLIED_SEARCH_TEXT':
      return { ...state, appliedSearchText: action.payload };
    case 'SET_DISPLAY_MODE':
      return { ...state, displayMode: action.payload };
    case 'SET_RANK_MODE':
      return { ...state, rankMode: action.payload };
    case 'SET_RANK_FIELD':
      return { ...state, rankField: action.payload };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, page: 1 }; // 重置页码
    case 'SET_PAGE_TOTAL':
      return { ...state, pageTotal: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PAGE_DATA':
      return { ...state, pageData: action.payload };
    case 'SET_SEARCH_GROUPS':
      return { ...state, searchGroups: action.payload };
    case 'SET_SEARCH_RESULT_TEXT':
      return { ...state, searchResultText: action.payload };
    default:
      return state;
  }
};

// 自定义钩子：获取 URL 查询参数
function useQueryParams() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const params: Record<string, string> = {};
  searchParams.forEach((value, name) => {
    params[name] = value;
  });

  return params;
}

const MankaListPage: React.FC = () => {
  const {
    kw = '',
    page = '1',
    pageSize = '25',
    displayMode = DisplayMode.TableList.toString(),
    rankField = RankField.ArchiveUpdatedTime.toString(),
    rankMode = RankMode.DESC.toString(),
  } = useQueryParams();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    searchText: kw,
    appliedSearchText: kw,
    page: Number.parseInt(page, 10) || 1,
    pageSize: Number.parseInt(pageSize, 10) || 25,
    displayMode: (displayMode as DisplayMode) || DisplayMode.TableList,
    rankField: (rankField as RankField) || RankField.ArchiveUpdatedTime,
    rankMode: (rankMode as RankMode) || RankMode.DESC,
  });

  const { enqueueSnackbar } = useSnackbar();
  const confirm = useConfirm();

  const isFetchingRef = useRef(false); // 新增的 ref 用于跟踪是否正在加载

  // 更新 URL
  const updateUrl = useCallback(
    (newState: Partial<State>) => {
      const searchParams = new URLSearchParams();

      if (newState.appliedSearchText !== undefined) {
        if (newState.appliedSearchText) {
          searchParams.set('kw', newState.appliedSearchText);
        } else {
          searchParams.delete('kw');
        }
      }
      if (newState.page !== undefined) {
        searchParams.set('page', newState.page.toString());
      }
      if (newState.pageSize !== undefined) {
        searchParams.set('pageSize', newState.pageSize.toString());
      }
      if (newState.displayMode !== undefined) {
        searchParams.set('displayMode', newState.displayMode.toString());
      }
      if (newState.rankField !== undefined) {
        searchParams.set('rankField', newState.rankField.toString());
      }
      if (newState.rankMode !== undefined) {
        searchParams.set('rankMode', newState.rankMode.toString());
      }

      navigate(`?${searchParams.toString()}`, { replace: true });
    },
    [navigate],
  );

  // 处理搜索
  const handleSearch = useCallback(
    async (append = false): Promise<void> => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      dispatch({ type: 'SET_LOADING', payload: true });

      const queryText = state.appliedSearchText;
      const query = {
        query: queryText,
        page: {
          pageNo: append ? state.page + 1 : state.page,
          pageSize: state.pageSize,
        },
        order: [
          { field: state.rankField, Asc: state.rankMode === RankMode.ASC },
        ],
      };

      try {
        const {
          data: { data },
        } = await API.post<Response<PageMankaArchive>>('/manka/search', query);

        dispatch({ type: 'SET_PAGE_TOTAL', payload: data.pageTotal });
        dispatch({
          type: 'SET_PAGE_DATA',
          payload: append
            ? [...state.pageData, ...data.pageData]
            : data.pageData,
        });
        dispatch({
          type: 'SET_SEARCH_RESULT_TEXT',
          payload: queryText
            ? `搜索: ${queryText} 结果数: ${data.pageTotal}`
            : '',
        });
      } catch (e) {
        console.error('err', e);
        enqueueSnackbar(`${e}`, { variant: 'error' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        isFetchingRef.current = false;
      }
    },
    [
      state.appliedSearchText,
      state.page,
      state.pageSize,
      state.rankField,
      state.rankMode,
      state.pageData,
      enqueueSnackbar,
    ],
  );

  // 监听相关状态变化进行搜索
  useEffect(() => {
    handleSearch();
    updateUrl(state); // 确保每次状态变化时更新 URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.appliedSearchText,
    state.page,
    state.pageSize,
    state.displayMode,
    state.rankField,
    state.rankMode,
  ]);

  // 获取搜索组
  const fetchSearchGroups = useCallback(async () => {
    try {
      const {
        data: { data },
      } = await API.get<Response<SearchGroup[]>>('/searchGroup/list');
      dispatch({ type: 'SET_SEARCH_GROUPS', payload: data });
    } catch (e) {
      console.error('err', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchSearchGroups();
  }, [fetchSearchGroups]);

  // 清理搜索
  const handleClearSearch = () => {
    dispatch({ type: 'SET_SEARCH_TEXT', payload: '' });
    dispatch({ type: 'SET_APPLIED_SEARCH_TEXT', payload: '' });
    updateUrl({ searchText: '', page: 1 });
  };

  // 改变显示模式
  const handleDisplayModeChange = () => {
    const newMode =
      state.displayMode === DisplayMode.TableList
        ? DisplayMode.ImageList
        : DisplayMode.TableList;
    dispatch({ type: 'SET_DISPLAY_MODE', payload: newMode });
    updateUrl({ displayMode: newMode });
  };

  // 改变排序字段
  const handleRankFieldChange = (e: SelectChangeEvent<RankField>) => {
    const newField = e.target.value as RankField;
    dispatch({ type: 'SET_RANK_FIELD', payload: newField });
    updateUrl({ rankField: newField });
  };

  // 改变页面大小
  const handlePageSizeChange = (e: SelectChangeEvent<number>) => {
    const newSize = e.target.value as number;
    dispatch({ type: 'SET_PAGE_SIZE', payload: newSize });
    updateUrl({ pageSize: newSize, page: 1 });
  };

  // 改变排序模式
  const handleRankModeChange = () => {
    const newMode =
      state.rankMode === RankMode.ASC ? RankMode.DESC : RankMode.ASC;
    dispatch({ type: 'SET_RANK_MODE', payload: newMode });
    updateUrl({ rankMode: newMode });
  };

  // 处理搜索输入变化
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const newSearchText = event.target.value;
    dispatch({ type: 'SET_SEARCH_TEXT', payload: newSearchText });
    // 不再在输入变化时更新 URL
    // updateUrl({ searchText: newSearchText });
  };

  // 追加搜索文本
  const appendSearchText = (addSearchText: string) => {
    const trimmedAddSearchText = addSearchText.trim();
    if (trimmedAddSearchText.length === 0) {
      return;
    }

    const parseSearchText = (text: string): Map<string, string> => {
      return text.split(',').reduce((map, pair) => {
        const trimmedPair = pair.trim();
        if (trimmedPair.length === 0) {
          return map;
        }

        const [key, ...rest] = trimmedPair.split(':');
        const value = rest.join(':').trim();

        if (key && value) {
          map.set(key.trim(), trimmedPair);
        } else {
          map.set(trimmedPair, trimmedPair);
        }

        return map;
      }, new Map<string, string>());
    };

    const currentMap = parseSearchText(state.searchText);
    const additionalMap = parseSearchText(trimmedAddSearchText);

    additionalMap.forEach((value, key) => {
      currentMap.set(key, value);
    });

    const mergedSearchText = Array.from(currentMap.values()).join(',');
    const sanitizedSearchText = mergedSearchText
      .split(',')
      .map((term) => term.trim())
      .filter((term) => term.length > 0)
      .join(',');

    dispatch({ type: 'SET_SEARCH_TEXT', payload: sanitizedSearchText });
    updateUrl({ searchText: sanitizedSearchText, page: 1 });
  };

  // 删除搜索组
  const handleSearchGroupRemove = (sg: SearchGroup) => {
    confirm({
      description: `确定要移除搜索组[${sg.searchGroupName}]吗？`,
    })
      .then(async () => {
        try {
          await API.get<Response<void>>(
            `/searchGroup/remove/${sg.searchGroupId}`,
          );
          fetchSearchGroups();
        } catch (e) {
          console.error('err', e);
          enqueueSnackbar(`${e}`, { variant: 'error' });
        }
      })
      .catch(() => {
        // 用户取消
      });
  };

  // 添加查询到搜索组
  const addQueryToSearchGroup = async (query: string) => {
    try {
      const data = {
        searchGroupName: query,
        searchQuery: query,
      };
      await API.post<Response<void>>('/searchGroup/add', data);
      fetchSearchGroups();
    } catch (e) {
      console.error('err', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    }
  };

  // 点击标签回调
  const clickTagCallback = (tag: MankaArchiveTag) => {
    appendSearchText(`${tag.tagName}:${tag.tagValue}`);
  };

  // 搜索组组件
  const SearchGroupStack: React.FC = () => {
    return (
      <React.Fragment>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {state.searchGroups &&
            state.searchGroups.length > 0 &&
            state.searchGroups.map((sg) => (
              <Chip
                label={sg.searchGroupName}
                icon={<StarIcon fontSize={'small'} />}
                variant="outlined"
                key={sg.searchGroupId}
                size={'small'}
                onClick={() => appendSearchText(sg.searchQuery)}
                onDelete={async () => handleSearchGroupRemove(sg)}
              />
            ))}
        </Stack>
      </React.Fragment>
    );
  };

  // 添加到收藏
  const addToFavorite = useCallback(
    async (manka: MankaArchive) => {
      confirm({
        description: `确定要添加${manka.archiveName}到收藏吗？`,
      })
        .then(async () => {
          try {
            const data = { archiveId: manka.archiveId };
            const response = await API.post<Response<{ favoriteId: string }>>(
              '/favorite/add',
              data,
            );

            if (!response.data.data.favoriteId) {
              console.warn('没有从 API 返回 favoriteId');
              return;
            }

            dispatch({
              type: 'SET_PAGE_DATA',
              payload: state.pageData.map((item) =>
                item.archiveId === manka.archiveId
                  ? { ...item, belongFavoriteId: response.data.data.favoriteId }
                  : item,
              ),
            });

            enqueueSnackbar('已加入收藏', { variant: 'success' });
          } catch (e) {
            console.error('添加到收藏时出错:', e);
            enqueueSnackbar(`${e}`, { variant: 'error' });
          }
        })
        .catch(() => {
          // 用户取消
        });
    },
    [enqueueSnackbar, state.pageData, confirm],
  );

  // 删除收藏
  const deleteFavorite = useCallback(
    async (favoriteId: string) => {
      confirm({
        description: "确定要移除收藏吗？",
      })
        .then(async () => {
          try {
            await API.get<Response<void>>(`/favorite/remove/${favoriteId}`);
            dispatch({
              type: 'SET_PAGE_DATA',
              payload: state.pageData.map((item) =>
                item.belongFavoriteId === favoriteId
                  ? { ...item, belongFavoriteId: undefined }
                  : item,
              ),
            });

            enqueueSnackbar('已取消收藏', { variant: 'success' });
          } catch (e) {
            console.error('删除收藏时出错:', e);
            enqueueSnackbar(`${e}`, { variant: 'error' });
          }
        })
        .catch(() => {
          // 用户取消
        });
    },
    [enqueueSnackbar, state.pageData, confirm],
  );

  // 改变页面
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    dispatch({ type: 'SET_PAGE', payload: newPage });
    updateUrl({ page: newPage });
  };

  return (
    <Container maxWidth={'xl'}>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Typography variant="h4" align="center">
          welcome!
        </Typography>
      </Box>
      <Box>
        <SearchGroupStack />
      </Box>
      <Box>
        <TextField
          size={'small'}
          fullWidth
          variant="outlined"
          placeholder="search..."
          value={state.searchText}
          disabled={state.loading}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: (
              <ButtonGroup>
                <IconButton
                  onClick={() =>
                    dispatch({
                      type: 'SET_APPLIED_SEARCH_TEXT',
                      payload: state.searchText,
                    })
                  }
                >
                  <SearchIcon />
                </IconButton>
                <IconButton
                  onClick={handleClearSearch}
                  disabled={state.searchText === ''}
                >
                  <ClearIcon />
                </IconButton>
              </ButtonGroup>
            ),
          }}
        />
      </Box>
      {state.searchResultText !== '' && (
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography align="center">{state.searchResultText}</Typography>
          <Tooltip title={'加入搜索组'}>
            <IconButton onClick={() => addQueryToSearchGroup(state.searchText)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Select
            labelId="sort-select"
            id="sort-select"
            value={state.rankField}
            onChange={handleRankFieldChange}
            input={<Input />}
            disabled={state.loading}
          >
            <MenuItem value={RankField.ArchiveName}>名称</MenuItem>
            <MenuItem value={RankField.ArchiveSize}>大小</MenuItem>
            <MenuItem value={RankField.ArchiveTotalPage}>页数</MenuItem>
            <MenuItem value={RankField.ArchiveCreatedTime}>
              系统录入时间
            </MenuItem>
            <MenuItem value={RankField.ArchiveUpdatedTime}>
              系统更新时间
            </MenuItem>
            <MenuItem value={RankField.ArchiveModTime}>档案修改时间</MenuItem>
            <MenuItem value={RankField.ArchiveLastReadAt}>
              最后阅读时间
            </MenuItem>
          </Select>
          <IconButton
            title={'sortMethod'}
            onClick={handleRankModeChange}
            color={'inherit'}
            disabled={state.loading}
          >
            {state.rankMode === RankMode.DESC ? (
              <TextRotationDownIcon />
            ) : (
              <TextRotateUpIcon />
            )}
          </IconButton>
        </Box>
        <Box>
          <Pagination
            disabled={state.loading}
            count={Math.ceil(state.pageTotal / state.pageSize)}
            page={state.page}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
            size="small"
            siblingCount={1}
            boundaryCount={1}
            showFirstButton
            showLastButton
          />
        </Box>
        <Box>
          <Select
            labelId="pageSize-select"
            id="pageSize-select"
            value={state.pageSize}
            onChange={handlePageSizeChange}
            input={<Input />}
            disabled={state.loading}
            size="small"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={35}>35</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={200}>200</MenuItem>
            <MenuItem value={250}>250</MenuItem>
            <MenuItem value={500}>500</MenuItem>
          </Select>
          <IconButton
            disabled={state.loading}
            onClick={handleDisplayModeChange}
          >
            {state.displayMode === DisplayMode.TableList ? (
              <GridViewIcon />
            ) : (
              <ListIcon />
            )}
          </IconButton>
        </Box>
      </Box>
      {state.loading && state.page === 1 ? ( // 仅在初始加载时显示 CircularProgress
        <CircularProgress />
      ) : state.displayMode === DisplayMode.ImageList ? (
        <ImageList cols={5} gap={10}>
          {state.pageData.map((manka) => (
            <MankaImgItem
              manka={manka}
              clickTagCallback={clickTagCallback}
              onCoverClick={(manka) => navigate(`/manka/${manka.archiveId}`)}
              addToFavorite={addToFavorite}
              deleteFavorite={deleteFavorite}
              key={manka.archiveId}
            />
          ))}
        </ImageList>
      ) : (
        <MankaTableListPage
          mankaData={state.pageData}
          clickTagCallback={clickTagCallback}
          addToFavorite={addToFavorite}
          deleteFavorite={deleteFavorite}
        />
      )}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Select
            labelId="sort-select"
            id="sort-select"
            value={state.rankField}
            onChange={handleRankFieldChange}
            input={<Input />}
            disabled={state.loading}
          >
            <MenuItem value={RankField.ArchiveName}>名称</MenuItem>
            <MenuItem value={RankField.ArchiveSize}>大小</MenuItem>
            <MenuItem value={RankField.ArchiveTotalPage}>页数</MenuItem>
            <MenuItem value={RankField.ArchiveCreatedTime}>
              系统录入时间
            </MenuItem>
            <MenuItem value={RankField.ArchiveUpdatedTime}>
              系统更新时间
            </MenuItem>
            <MenuItem value={RankField.ArchiveModTime}>档案修改时间</MenuItem>
            <MenuItem value={RankField.ArchiveLastReadAt}>
              最后阅读时间
            </MenuItem>
          </Select>
          <IconButton
            title={'sortMethod'}
            onClick={handleRankModeChange}
            color={'inherit'}
            disabled={state.loading}
          >
            {state.rankMode === RankMode.DESC ? (
              <TextRotationDownIcon />
            ) : (
              <TextRotateUpIcon />
            )}
          </IconButton>
        </Box>
        <Box>
          <Pagination
            disabled={state.loading}
            count={Math.ceil(state.pageTotal / state.pageSize)}
            page={state.page}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
            size="small"
            siblingCount={1}
            boundaryCount={1}
            showFirstButton
            showLastButton
          />
        </Box>
        <Box>
          <Select
            labelId="pageSize-select"
            id="pageSize-select"
            value={state.pageSize}
            onChange={handlePageSizeChange}
            input={<Input />}
            disabled={state.loading}
            size="small"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={35}>35</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={200}>200</MenuItem>
            <MenuItem value={250}>250</MenuItem>
            <MenuItem value={500}>500</MenuItem>
          </Select>
          <IconButton
            disabled={state.loading}
            onClick={handleDisplayModeChange}
          >
            {state.displayMode === DisplayMode.TableList ? (
              <GridViewIcon />
            ) : (
              <ListIcon />
            )}
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
};

export default MankaListPage;
