import FullscreenIcon from '@mui/icons-material/Fullscreen';
import TextRotateUpIcon from '@mui/icons-material/TextRotateUp';
import TextRotationDownIcon from '@mui/icons-material/TextRotationDown';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Input,
  MenuItem,
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
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../middleware/api';
import type { ArchiveItem, Favorite, MankaArchive } from '../../types';
import type { Response } from '../../types/response';
import FavoriteButton from './FavoriteButton';
import InfinityImgViewer from './InfinityImgViewer';
import PageImgViewer from './PageImgViewer';
import { getImgLink, logMankaHistory } from './store';
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
  const [currentPage, setCurrentPage] = useState<number>(1); //todo: 从 API 获取初始值
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('mankaId', mankaId);
    fetchMankaDetail();
  }, [mankaId]);

  // 使用 useMemo 计算排序后的数组
  const sortedImgItems = useMemo(() => {
    if (imgItems.length > 0) {
      console.log('order by', imgRankField, imgRankMode);
      return _.orderBy(imgItems, [imgRankField], [imgRankMode]);
    }
    return imgItems;
  }, [imgItems, imgRankField, imgRankMode]);

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
      setImgItems(archiveData?.archiveItems || []);
      setFavoriteId(archiveData.belongFavoriteId);
      const lastReadPage = archiveData.lastReadPage || 1;
      setCurrentPage(lastReadPage);
      logMankaHistory(mankaId, lastReadPage);
    } catch (e) {
      console.error('错误:', e);
      enqueueSnackbar('获取漫画详情失败', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      // 可选：将 newPage 更新到后端，记录用户的阅读进度
      if (mankaId) {
        logMankaHistory(mankaId, newPage);
      }
    },
    [mankaId],
  );

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
      await API.get<Response<unknown>>(`/favorite/remove/${favoriteId}`);
      setFavoriteId(undefined);
      enqueueSnackbar('已取消收藏', { variant: 'success' });
    } catch (e) {
      console.error('错误:', e);
      enqueueSnackbar('取消收藏失败', { variant: 'error' });
    }
  }, [favoriteId, enqueueSnackbar]);

  const TagStack: React.FC = React.memo(() => (
    <Stack direction="row" spacing={2} flexWrap="wrap">
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
      label: `${index + 1}`,
      value: index + 1,
    }));
  }, [sortedImgItems]);

  return (
    <Box display="flex">
      {/* 主内容区域 */}
      <Container>
        {' '}
        {/* 确保主内容不被 Toolbar 覆盖 */}
        {/*漫画前*/}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          {/*标题*/}
          <Box>
            <Typography>{`${mankaArchive?.archiveName}`}</Typography>
          </Box>
          {/* tag区 */}
          <Box>
            <TagStack />
          </Box>
          {/*整个漫画的操作项目*/}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            gap={3}
          >
            {/* 收藏按钮 */}
            <Box>
              <FavoriteButton
                favoriteId={favoriteId}
                onAdd={addToFavorite}
                onRemove={deleteFavorite}
              />
            </Box>
            {/* 排序方式 */}
            <Box>
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
            <Box>
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
                <MenuItem value={DetailImgMode.PhotoMode}>画廊模式</MenuItem>
              </Select>
            </Box>
            {/* 图片规格 */}
            <Box>
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
            {/* 跳页控件，使用 Select 代替 Autocomplete */}
            <Box>
              <Select
                value={currentPage}
                onChange={(event) => handleJumpPage(Number(event.target.value))}
                size="small"
                sx={{ width: '80px' }}
              >
                {Array.from({ length: sortedImgItems.length }, (_, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
          {/*漫画展示区*/}
          <Box flex={1}>
            {sortedImgItems.length <= 0 || loading ? (
              <CircularProgress />
            ) : (
              <>
                {imgDisplayMode === DetailImgMode.PageMode && (
                  <PageImgViewer
                    mankaId={mankaId}
                    imgSpec={imgSpec}
                    totalPage={sortedImgItems.length}
                    sortedImgItems={sortedImgItems}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                )}
                {imgDisplayMode === DetailImgMode.PhotoMode && (
                  <Box aria-label="page-view-photo-mode">
                    <PhotoProvider
                      // @ts-ignore
                      toolbarRender={({
                        rotate,
                        onRotate,
                        onScale,
                        scale,
                        index,
                      }) => {
                        return (
                          <>
                            <svg
                              className="PhotoView-Slider__toolbarIcon"
                              width="44"
                              height="44"
                              viewBox="0 0 768 768"
                              fill="white"
                              onClick={() => onScale(scale + 0.5)}
                            >
                              <path d="M384 640.5q105 0 180.75-75.75t75.75-180.75-75.75-180.75-180.75-75.75-180.75 75.75-75.75 180.75 75.75 180.75 180.75 75.75zM384 64.5q132 0 225.75 93.75t93.75 225.75-93.75 225.75-225.75 93.75-225.75-93.75-93.75-225.75 93.75-225.75 225.75-93.75zM415.5 223.5v129h129v63h-129v129h-63v-129h-129v-63h129v-129h63z" />
                            </svg>
                            <svg
                              className="PhotoView-Slider__toolbarIcon"
                              width="44"
                              height="44"
                              viewBox="0 0 768 768"
                              fill="white"
                              onClick={() => onScale(scale - 0.5)}
                            >
                              <path d="M384 640.5q105 0 180.75-75.75t75.75-180.75-75.75-180.75-180.75-75.75-180.75 75.75-75.75 180.75 75.75 180.75 180.75 75.75zM384 64.5q132 0 225.75 93.75t93.75 225.75-93.75 225.75-225.75 93.75-225.75-93.75-93.75-225.75 93.75-225.75 225.75-93.75zM223.5 352.5h321v63h-321v-63z" />
                            </svg>
                            <svg
                              className="PhotoView-Slider__toolbarIcon"
                              onClick={() => {
                                setImages((prev) => {
                                  const result = [...prev];
                                  result.splice(index, 1, dog.src);
                                  return result;
                                });
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              width="44"
                              height="44"
                              fill="white"
                              viewBox="0 0 768 768"
                            >
                              <path d="M384 559.5c-75 0-138-45-163.5-111h327c-25.5 66-88.5 111-163.5 111zM271.5 352.5c-27 0-48-21-48-48s21-48 48-48 48 21 48 48-21 48-48 48zM496.5 352.5c-27 0-48-21-48-48s21-48 48-48 48 21 48 48-21 48-48 48zM384 640.5c141 0 256.5-115.5 256.5-256.5s-115.5-256.5-256.5-256.5-256.5 115.5-256.5 256.5 115.5 256.5 256.5 256.5zM384 64.5c177 0 319.5 142.5 319.5 319.5s-142.5 319.5-319.5 319.5-319.5-142.5-319.5-319.5 142.5-319.5 319.5-319.5z" />
                            </svg>
                          </>
                        );
                      }}
                    >
                      {sortedImgItems.map((item, index) => (
                        <PhotoView
                          key={item.archiveItemId}
                          src={getImgLink(
                            mankaId,
                            item.archiveItemIndex,
                            imgSpec,
                          )}
                        >
                          {index < 1 ? (
                            <img
                              src={getImgLink(
                                mankaId,
                                item.archiveItemIndex,
                                imgSpec,
                              )}
                              alt={item.archiveItemName}
                            />
                          ) : undefined}
                        </PhotoView>
                      ))}
                    </PhotoProvider>
                  </Box>
                )}
                {imgDisplayMode === DetailImgMode.InfinityMode && (
                  <InfinityImgViewer
                    mankaId={mankaId}
                    imgSpec={imgSpec}
                    sortedImgItems={sortedImgItems}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
