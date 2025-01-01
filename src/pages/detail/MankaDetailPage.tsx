import TextRotateUpIcon from '@mui/icons-material/TextRotateUp';
import TextRotationDownIcon from '@mui/icons-material/TextRotationDown';
import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Input,
  MenuItem,
  Pagination,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import errorImg from '../../assets/images/404.png';
import loadImg from '../../assets/images/anime_loading.gif';
import API from '../../middleware/api';
import type { ArchiveItem, Favorite, MankaArchive } from '../../types';
import type { Response } from '../../types/response';
import { sizeToString } from '../../utils/datetime';
import FavoriteButton from './FavoriteButton';
import InfinityImgViewer from './InfinityImgViewer';
import PageImgViewer from './PageImgViewer';
import { DetailImgMode, ImgRankField, ImgRankMode, ImgSpec } from './types';

export default function MankaDetailPage() {
  const { mankaId } = useParams();
  const [mankaArchive, setMankaArchive] = useState<MankaArchive | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [imgItems, setImgItems] = useState<ArchiveItem[]>([]);
  const [imgDisplayMode, setImgDisplayMode] = useState<DetailImgMode>(
    DetailImgMode.PageMode,
  ); // 默认是table
  const [imgRankField, setImgRankField] = useState<ImgRankField>(
    ImgRankField.ImgName,
  ); // 默认是按照name升序
  const [imgRankMode, setImgRankMode] = useState<ImgRankMode>(ImgRankMode.ASC); // 默认是asc
  const [imgSpec, setImgSpec] = useState<ImgSpec>(ImgSpec.X1280Compress);
  const [favoriteId, setFavoriteId] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1); // 从 API 获取初始值
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('mankaId', mankaId);
    fetchMankaDetail();
  }, []);

  // 使用 useMemo 计算排序后的数组
  const sortedImgItems = useMemo(() => {
    if (imgItems.length > 0) {
      console.log('order by', imgRankField, imgRankMode);
      return _.orderBy(imgItems, [imgRankField], [imgRankMode]);
    }
    return imgItems;
  }, [imgItems, imgRankField, imgRankMode]);

  const getImgUrl = (archiveItem: ArchiveItem) => {
    return `/api/v1/manka/${mankaId}/${archiveItem.archiveItemIndex}/${imgSpec}/link`;
  };
  const handleImgRankFieldChange = useCallback(
    (e: SelectChangeEvent<ImgRankField>) => {
      setImgRankField(e.target.value as ImgRankField);
      setCurrentPage(1);
    },
    [],
  );

  const handleImgDisplayModeChange = useCallback(
    (e: SelectChangeEvent<DetailImgMode>) => {
      setImgDisplayMode(e.target.value as DetailImgMode);
      setCurrentPage(1);
    },
    [],
  );

  const handleImgSpecChange = useCallback((e: SelectChangeEvent<ImgSpec>) => {
    setImgSpec(e.target.value as ImgSpec);
    setCurrentPage(1);
  }, []);

  const handleImgRankModeChange = useCallback(() => {
    setImgRankMode((prevMode) =>
      prevMode === ImgRankMode.ASC ? ImgRankMode.DESC : ImgRankMode.ASC,
    );
    setCurrentPage(1);
  }, []);

  /**
   * 获取manka详情
   */
  const fetchMankaDetail = async () => {
    if (!mankaId) {
      enqueueSnackbar('无效的漫画ID', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const response = await API.get<Response<MankaArchive>>(
        `/manka/${mankaId}/detail`,
      );
      const archiveData = response.data.data;
      setMankaArchive(archiveData);
      const items = archiveData?.archiveItems || [];
      setImgItems(items);
      setFavoriteId(archiveData.belongFavoriteId);
      setCurrentPage(archiveData.lastReadPage || 1);
    } catch (e) {
      console.error('错误:', e);
      enqueueSnackbar('获取漫画详情失败', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    // 可选：将 newPage 更新到后端，记录用户的阅读进度
  }, []);

  // addToFavorite
  const addToFavorite = useCallback(async () => {
    if (!mankaArchive) return;
    try {
      const query = { archiveId: mankaArchive.archiveId };
      const response = await API.post<Response<Favorite>>(
        '/favorite/add',
        query,
      );
      setFavoriteId(response.data.data.favoriteId);
      enqueueSnackbar('已加入收藏', { variant: 'success' });
    } catch (e) {
      console.error('错误:', e);
      enqueueSnackbar('加入收藏失败', { variant: 'error' });
    }
  }, [mankaArchive, enqueueSnackbar]);

  // deleteFavorite
  const deleteFavorite = useCallback(async () => {
    if (!favoriteId) return;
    try {
      await API.get<Response<any>>(`/favorite/remove/${favoriteId}`);
      setFavoriteId(undefined);
      enqueueSnackbar('已取消收藏', { variant: 'success' });
    } catch (e) {
      console.error('错误:', e);
      enqueueSnackbar('取消收藏失败', { variant: 'error' });
    }
  }, [favoriteId, enqueueSnackbar]);

  const TagStack: React.FC = React.memo(() => (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {mankaArchive?.tags?.map((tag) => (
        <Chip
          label={`${tag.tagName}:${tag.tagValue}`}
          variant="outlined"
          key={`${tag.tagName}:${tag.tagValue}`}
          size="small"
          onClick={() => {
            navigate(
              `/?kw=${encodeURIComponent(`${tag.tagName}:${tag.tagValue}`)}`,
            );
          }}
        />
      ))}
    </Stack>
  ));

  const handleJumpPage = (page: number) => {
    if (page < 1 || page > sortedImgItems.length) {
      enqueueSnackbar(`请输入1至${sortedImgItems.length}之间的页码`, {
        variant: 'warning',
      });
      return;
    }
    console.log('跳转到第', page, '页');
    setCurrentPage(page);
  };

  // 准备跳页选项
  const jumpPageOptions = useMemo(() => {
    return sortedImgItems.map((item, index) => ({
      label: `p_${index + 1}: ${item.archiveItemName}`,
      value: index + 1,
    }));
  }, [sortedImgItems]);

  return (
    <Container>
      {/*漫画前*/}
      <Box>
        {/*标题*/}
        <Box display="flex" alignItems="center" justifyContent="center">
          <Typography>{`${mankaArchive?.archiveName}`}</Typography>
        </Box>
        {/* tag区 */}
        <Box display="flex" alignItems="center" justifyContent="center">
          <TagStack />
        </Box>
        {/*整个漫画的操作项目*/}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* 收藏按钮 */}
          <FavoriteButton 
            favoriteId={favoriteId}
            onAdd={addToFavorite}
            onRemove={deleteFavorite}
          />
          {/* 排序方式 */}
          <Box display="flex" alignItems="center">
            <Select
              id="sort-select"
              value={imgRankField}
              onChange={handleImgRankFieldChange}
              input={<Input />}
              disabled={loading}
              size="small"
              sx={{ mr: 1 }}
            >
              <MenuItem value={ImgRankField.ImgIndex}>图片索引</MenuItem>
              <MenuItem value={ImgRankField.ImgName}>图片名称</MenuItem>
              <MenuItem value={ImgRankField.ImgSize}>图片大小</MenuItem>
            </Select>
            <IconButton
              title="切换排序方式"
              onClick={handleImgRankModeChange}
              color="inherit"
              disabled={loading}
            >
              {imgRankMode === ImgRankMode.DESC ? (
                <TextRotationDownIcon />
              ) : (
                <TextRotateUpIcon />
              )}
            </IconButton>
          </Box>
          {/* 显示模式 */}
          <Box display="flex" alignItems="center">
            <Select
              id="display-mode-select"
              value={imgDisplayMode}
              onChange={handleImgDisplayModeChange}
              input={<Input />}
              disabled={loading}
              size="small"
              sx={{ mr: 1 }}
            >
              <MenuItem value={DetailImgMode.InfinityMode}>
                无限滚动模式
              </MenuItem>
              <MenuItem value={DetailImgMode.PageMode}>分页模式</MenuItem>
            </Select>
          </Box>
          {/* 图片规格 */}
          <Box display="flex" alignItems="center">
            <Select
              id="img-spec-select"
              value={imgSpec}
              onChange={handleImgSpecChange}
              input={<Input />}
              disabled={loading}
              size="small"
            >
              <MenuItem value={ImgSpec.Thumb}>缩略图</MenuItem>
              <MenuItem value={ImgSpec.X720Compress}>720x</MenuItem>
              <MenuItem value={ImgSpec.X1280Compress}>1280x</MenuItem>
              <MenuItem value={ImgSpec.NoResizeCompress}>无裁切图</MenuItem>
              <MenuItem value={ImgSpec.Origin}>原图</MenuItem>
            </Select>
          </Box>
          {/* 跳页 */}
          {/* 跳页控件，支持选择和输入 */}
          <Box display="flex" alignItems="center">
            <Autocomplete
              options={jumpPageOptions}
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : `${option.label}`
              }
              value={
                jumpPageOptions.find(
                  (option) => option.value === currentPage,
                ) ?? '第 2 页: Magisa_dl_03.jpg'
              }
              onChange={(event, newValue: any) => {
                console.log('newValue', newValue);
                handleJumpPage(newValue.value);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  // type="number"
                  placeholder="跳页"
                  // onKeyDown={(e) => {
                  //   if (e.key === "Enter") {
                  //     const value = Number((e.currentTarget as HTMLInputElement).value);
                  //     if (!isNaN(value)) {
                  //       handleJumpPage(value);
                  //     }
                  //   }
                  // }}
                  sx={{ mr: 2 }}
                />
              )}
              freeSolo
              disableClearable
              sx={{ width: '200px' }}
            />
          </Box>
        </Box>
      </Box>
      {/*漫画展示区*/}
      <Box>
        {sortedImgItems.length <= 0 || loading ? (
          <CircularProgress />
        ) : imgDisplayMode === DetailImgMode.PageMode ? (
          <PageImgViewer
            mankaId={mankaId}
            imgSpec={imgSpec}
            totalPage={sortedImgItems.length}
            sortedImgItems={sortedImgItems}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        ) : (
          <InfinityImgViewer
            mankaId={mankaId}
            imgSpec={imgSpec}
            sortedImgItems={sortedImgItems}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </Box>
    </Container>
  );
}
