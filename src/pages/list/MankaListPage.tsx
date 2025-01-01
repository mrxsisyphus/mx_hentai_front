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
  Input,
  MenuItem,
  Pagination,
  Select,
  type SelectChangeEvent,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../middleware/api';
import type {
  MankaArchive,
  MankaArchiveTag,
  PageMankaArchive,
  SearchGroup,
} from '../../types';
import type { Response } from '../../types/response';
import MankaImgListPage from './MankaImgListPage';
import MankaTableListPage from './MankaTableListPage';
import { DisplayMode, RankField, RankMode } from './types';

function useQueryParams() {
  const location = useLocation(); // Get the current location object
  const searchParams = new URLSearchParams(location.search); // Create a URLSearchParams object from the query string

  // Convert URLSearchParams object to a plain object
  const params: Record<string, string> = {};
  searchParams.forEach((value, name) => {
    params[name] = value; // Store each query parameter in the params object
  });

  return params; // Return the params object
}

const MankaListPage: React.FC = () => {
  const { kw = '' } = useQueryParams();

  // searchText
  const [searchText, setSearchText] = useState<string>(kw);
  // displayMode
  const [displayMode, setDisplayMode] = useState<DisplayMode>(
    DisplayMode.TableList,
  ); // 默认是table
  // rankMode
  const [rankMode, setRankMode] = useState<RankMode>(RankMode.DESC); // 默认是desc

  const [rankField, setRankField] = useState<RankField>(
    RankField.ArchiveUpdatedTime,
  ); // 默认是按照更新时间降序

  //页数
  const [page, setPage] = useState<number>(1);

  const [pageSize, setPageSize] = useState<number>(25);

  const [pageTotal, setPageTotal] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  const [pageData, setPageData] = useState<MankaArchive[]>([]);
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [searchResultText, setSearchResultText] = useState<string>('');

  const { enqueueSnackbar } = useSnackbar();

  const handleSearch = useCallback(async (inputText?: string): Promise<void> => {
    console.log('handleSearch...');
    setLoading(true);
    const queryText = inputText === undefined ? searchText : inputText;
    const query = {
      query: queryText,
      page: { pageNo: page, pageSize },
      order: [{ field: rankField, Asc: rankMode === RankMode.ASC }],
    };
    try {
      const { data: { data } } = await API.post<Response<PageMankaArchive>>('/manka/search', query);
      setPageTotal(data.pageTotal);
      setPageData(data.pageData);
      setSearchResultText(queryText ? `搜索: ${queryText} 结果数: ${data.pageTotal}` : '');
    } catch (e) {
      console.error('err', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, rankMode, rankField, searchText, enqueueSnackbar]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  useEffect(() => {
    fetchSearchGroups();
  }, []);

  /**
   * 清理searchText
   */
  const handleClearSearch = () => {
    setPage(1);
    setSearchText('');
    handleSearch('');
  };

  const fetchSearchGroups = async () => {
    console.log('fetchSearchGroups...');
    try {
      const {
        data: { data },
      } = await API.get<Response<SearchGroup[]>>('/searchGroup/list');
      console.log('queryRes', data);
      setSearchGroups(data);
    } catch (e) {
      console.error('err', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    } finally {
    }
  };

  /**
   * 改变displayMode
   */
  const handleDisplayModeChange = () => {
    setDisplayMode((prevMode) =>
      prevMode === DisplayMode.TableList
        ? DisplayMode.ImageList
        : DisplayMode.TableList,
    );
  };

  const handleRankFieldChange = (e: SelectChangeEvent<RankField>) => {
    setRankField(e.target.value as RankField);
  };

  const handlePageSizeChange = (e: SelectChangeEvent<number>) => {
    setPageSize(e.target.value as number);
  };

  /**
   * 改变rankMode
   */
  const handleRankModeChange = () => {
    setRankMode((prevMode) =>
      prevMode === RankMode.ASC ? RankMode.DESC : RankMode.ASC,
    );
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    setSearchText(event.target.value);
  };

  // const handleRankFieldChange = (field: RankField) => {
  //     unstable_batchedUpdates(()=>{
  //         setRankField(field)
  //         setSortMenuAnchor(null)
  //     })
  // }

  /**
   * Appends new search terms to the existing search text.
   * Ensures that keys are unique, updates existing keys if necessary,
   * and prevents leading/trailing commas.
   * @param addSearchText - The search text to add, formatted as comma-separated key:value pairs or plain terms.
   */
  const appendSearchText = (addSearchText: string) => {
    const trimmedAddSearchText = addSearchText.trim();
    if (trimmedAddSearchText.length === 0) {
      return;
    }

    /**
     * Parses a search text string into a Map.
     * @param text - The search text to parse.
     * @returns A Map where the key is the search key and the value is the full pair.
     */
    const parseSearchText = (text: string): Map<string, string> => {
      return text.split(',').reduce((map, pair) => {
        const trimmedPair = pair.trim();
        if (trimmedPair.length === 0) {
          // Skip empty pairs resulting from consecutive commas or leading/trailing commas
          return map;
        }

        const [key, ...rest] = trimmedPair.split(':');
        const value = rest.join(':').trim(); // Handles cases with multiple colons

        if (key && value) {
          map.set(key.trim(), trimmedPair);
        } else {
          // For plain terms without a colon, use the entire pair as both key and value
          map.set(trimmedPair, trimmedPair);
        }

        return map;
      }, new Map<string, string>());
    };

    // Parse current and additional search texts into Maps
    const currentMap = parseSearchText(searchText);
    const additionalMap = parseSearchText(trimmedAddSearchText);

    // Merge additionalMap into currentMap, overwriting existing keys
    additionalMap.forEach((value, key) => {
      currentMap.set(key, value);
    });

    // Convert the merged Map back to a comma-separated string
    const mergedSearchText = Array.from(currentMap.values()).join(',');

    // Sanitize the merged search text to remove any unintended leading/trailing commas
    const sanitizedSearchText = mergedSearchText
      .split(',')
      .map((term) => term.trim())
      .filter((term) => term.length > 0) // Remove empty terms
      .join(',');

    // Update state and trigger search
    setSearchText(sanitizedSearchText);
    handleSearch(sanitizedSearchText);
  };

  const confirm = useConfirm();
  const handleSearchGroupRemove = (sg: SearchGroup) => {
    confirm({
      description: `will to remove searchGroup[${sg.searchGroupName}]`,
    })
      .then(async () => {
        try {
          await API.get<Response<void>>(
            `/searchGroup/remove/${sg.searchGroupId}`,
          );
          //refetch
          fetchSearchGroups();
        } catch (e) {
          console.error('err', e);
          enqueueSnackbar(`${e}`, { variant: 'error' });
        } finally {
        }
      })
      .catch(() => {
        // console.log("cancelled");
      });
  };

  const addQueryToSearchGroup = async (query: string) => {
    console.log(`will add ${query} to addQueryToSearchGroup`);
    try {
      const data = {
        searchGroupName: query,
        searchQuery: query,
      };
      await API.post<Response<void>>('/searchGroup/add', data);
      //refetch
      fetchSearchGroups();
    } catch (e) {
      console.error('err', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    } finally {
    }
  };

  const clickTagCallback = (tag: MankaArchiveTag) => {
    console.log('clickTagCallback', tag);
    appendSearchText(`${tag.tagName}:${tag.tagValue}`);
  };

  const SearchGroupStack: React.FC = () => {
    return (
      <React.Fragment>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {searchGroups &&
            searchGroups.length > 0 &&
            searchGroups.map((sg) => (
              <Chip
                label={sg.searchGroupName}
                icon={<StarIcon fontSize={'small'} />}
                variant="outlined"
                key={sg.searchGroupId}
                size={'small'}
                onClick={() => appendSearchText(sg.searchQuery)}
                onDelete={async () => handleSearchGroupRemove(sg)}
                // style={{ maxWidth: 'calc(100% - 16px)', overflow: 'hidden', textOverflow: 'ellipsis' }} // Added style for wrapping
              />
            ))}
        </Stack>
      </React.Fragment>
    );
  };

  const addToFavorite = useCallback(async (manka: MankaArchive) => {
    try {
      console.log('Attempting to add to favorite:', manka);

      const data = { archiveId: manka.archiveId };
      const response = await API.post<Response<{ favoriteId: string }>>('/favorite/add', data);

      if (!response.data.data.favoriteId) {
        console.warn('No favoriteId returned from API');
        return;
      }

      console.log('Successfully added to favorite:', response.data.data.favoriteId);

      // Update the specific item in state
      setPageData(prevData => 
        prevData.map(item => 
          item.archiveId === manka.archiveId 
            ? { ...item, belongFavoriteId: response.data.data.favoriteId }
            : item
        )
      );

      console.log('Updated local state to add favorite.');
      enqueueSnackbar('已加入收藏', { variant: 'success' });
    } catch (e) {
      console.error('Error adding to favorite:', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const deleteFavorite = useCallback(async (favoriteId: string) => {
    try {
      await API.get<Response<void>>(`/favorite/remove/${favoriteId}`);
      console.log('Successfully removed favorite from server.');

      // Update the specific item in state using archiveId
      setPageData(prevData => 
        prevData.map(item => 
          item.belongFavoriteId === favoriteId
            ? { ...item, belongFavoriteId: undefined }
            : item
        )
      );
      console.log('Updated local state to remove favorite.');
      enqueueSnackbar('已取消收藏', { variant: 'success' });
    } catch (e) {
      console.error('Error removing favorite:', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    }
  },[enqueueSnackbar]);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Typography variant="h4" align="center">
          welcome!
        </Typography>
      </Box>
      <Box>
        <Container maxWidth={'xl'}>
          <Box>
            <SearchGroupStack />
          </Box>
          <Box>
            <TextField
              size={'small'}
              fullWidth
              variant="outlined"
              placeholder="search..."
              value={searchText}
              disabled={loading}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <ButtonGroup>
                    <IconButton onClick={() => handleSearch()}>
                      <SearchIcon />
                    </IconButton>
                    <IconButton
                      onClick={handleClearSearch}
                      disabled={searchText === ''}
                    >
                      <ClearIcon />
                    </IconButton>
                  </ButtonGroup>
                ),
              }}
            />
          </Box>
          {searchResultText !== '' && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography align="center">{searchResultText}</Typography>
              <Tooltip title={'加入搜索组'}>
                <IconButton onClick={() => addQueryToSearchGroup(searchText)}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Select
                labelId="sort-select"
                id="sort-select"
                value={rankField}
                onChange={handleRankFieldChange}
                input={<Input />}
                disabled={loading}
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
                <MenuItem value={RankField.ArchiveModTime}>
                  档案修改时间
                </MenuItem>
                <MenuItem value={RankField.ArchiveLastReadAt}>
                  最后阅读时间
                </MenuItem>
              </Select>
              <IconButton
                title={'sortMethod'}
                onClick={handleRankModeChange}
                color={'inherit'}
                disabled={loading}
              >
                {rankMode === RankMode.DESC ? (
                  <TextRotationDownIcon />
                ) : (
                  <TextRotateUpIcon />
                )}
              </IconButton>
            </Box>
            <Box>
              <Pagination
                disabled={loading}
                count={Math.ceil(pageTotal / pageSize)}
                page={page}
                onChange={(_, page) => setPage(page)}
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
                value={pageSize}
                onChange={handlePageSizeChange}
                input={<Input />}
                disabled={loading}
                size="small"
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={35}>35</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
              <IconButton disabled={loading} onClick={handleDisplayModeChange}>
                {displayMode === DisplayMode.TableList ? (
                  <GridViewIcon />
                ) : (
                  <ListIcon />
                )}
              </IconButton>
            </Box>
          </Box>
          {loading ? (
            <CircularProgress />
          ) : displayMode === DisplayMode.ImageList ? (
            <MankaImgListPage
              mankaData={pageData}
              clickTagCallback={clickTagCallback}
              addToFavorite={addToFavorite}
              deleteFavorite={deleteFavorite}
            />
          ) : (
            <MankaTableListPage
              mankaData={pageData}
              clickTagCallback={clickTagCallback}
              addToFavorite={addToFavorite}
              deleteFavorite={deleteFavorite}
            />
          )}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Select
                labelId="sort-select"
                id="sort-select"
                value={rankField}
                onChange={handleRankFieldChange}
                input={<Input />}
                disabled={loading}
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
                <MenuItem value={RankField.ArchiveModTime}>
                  档案修改时间
                </MenuItem>
                <MenuItem value={RankField.ArchiveLastReadAt}>
                  最后阅读时间
                </MenuItem>
              </Select>
              <IconButton
                title={'sortMethod'}
                onClick={handleRankModeChange}
                color={'inherit'}
                disabled={loading}
              >
                {rankMode === RankMode.DESC ? (
                  <TextRotationDownIcon />
                ) : (
                  <TextRotateUpIcon />
                )}
              </IconButton>
            </Box>
            <Box>
              <Pagination
                disabled={loading}
                count={Math.ceil(pageTotal / pageSize)}
                page={page}
                onChange={(_, page) => setPage(page)}
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
                value={pageSize}
                onChange={handlePageSizeChange}
                input={<Input />}
                disabled={loading}
                size="small"
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={35}>35</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
              <IconButton disabled={loading} onClick={handleDisplayModeChange}>
                {displayMode === DisplayMode.TableList ? (
                  <GridViewIcon />
                ) : (
                  <ListIcon />
                )}
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MankaListPage;
