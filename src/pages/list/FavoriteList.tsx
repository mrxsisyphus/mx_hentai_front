import StarIcon from '@mui/icons-material/Star';
import TextRotateUpIcon from '@mui/icons-material/TextRotateUp';
import TextRotationDownIcon from '@mui/icons-material/TextRotationDown';
import {
  CircularProgress,
  Container,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Input,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useSnackbar } from 'notistack';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useNavigate } from 'react-router-dom';
import errorImg from '../../assets/images/404.png';
import loadImg from '../../assets/images/anime_loading.gif';
import MankaTagsPanelPopover from '../../components/MankaTagsPanelPopover';
import API from '../../middleware/api';
import type { Favorite, MankaArchive, MankaArchiveTag } from '../../types';
import type { Response } from '../../types/response';
import { ImgRankField, ImgRankMode } from '../detail/types';
import MankaImgItem from './MankaImgItem';
import { RankField, RankMode } from './types';
import { debounce } from 'lodash';

const preloadPage = 10;

export default function FavoriteList() {
  const [displayData, setDisplayData] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const containerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(page);
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    isLoadingRef.current = loading;
  }, [loading]);

  // 引入pageRef 是为了让fetchData 不依赖于page
  //让fetchData的函数不发生改变  从而让整个依赖链都不需要改变
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    fetchFavoriteList();
  }, []);

  const fetchFavoriteList = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const currentPage = pageRef.current;
    console.log('fetchData', currentPage);
    try {
      const {
        data: { data },
      } = await API.get<Response<Favorite[]>>('/favorite/list', {
        params: { page: currentPage },
      });
      const sliceData = data.slice(
        (currentPage - 1) * preloadPage,
        currentPage * preloadPage,
      );
      console.log('sliceData', sliceData);
      setDisplayData((prev) => [...prev, ...sliceData]);
      setHasMore(preloadPage < data.length);
      setPage((prev) => prev + 1);
    } catch (e) {
      console.error('err', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollThreshold = 50;
    const { scrollTop, scrollHeight, clientHeight } = container;
    // console.log('[scroll debug ]', scrollTop, scrollHeight, clientHeight);
    if (
      scrollTop + clientHeight >= scrollHeight - scrollThreshold &&
      !isLoadingRef.current
    ) {
      fetchFavoriteList();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScrollWithDebounce = debounce(handleScroll, 200);
    container.addEventListener('scroll', handleScrollWithDebounce);

    return () => {
      container.removeEventListener('scroll', handleScrollWithDebounce);
      handleScrollWithDebounce.cancel();
    };
  }, [handleScroll]);

  const deleteFavorite = async (favoriteId: string) => {
    console.log('deleteFavorite', favoriteId);
    try {
      await API.get<Response<void>>(`/favorite/remove/${favoriteId}`);
      fetchFavoriteList();
    } catch (e) {
      console.error('err', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const clickTagCallback = (tag: MankaArchiveTag) => {
    console.log('clickTagCallback', tag);
    navigate(`/?kw=${tag.tagName}:${tag.tagValue}`); // Navigate to MankaListPage with kw query parameter
  };

  const onCoverClick = (manka: MankaArchive) => {
    navigate(`/manka/${manka.archiveId}`);
  };
  return (
    <>
      <Container
        maxWidth={'xl'}
        ref={containerRef}
        sx={{
          overflowY: 'auto',
          height: '100%',
        }}
      >
        <ImageList variant="standard" cols={5} gap={10}>
          {displayData?.map(
            (favorite, index) =>
              favorite?.archive && (
                <MankaImgItem
                  manka={{
                    ...favorite.archive,
                    belongFavoriteId: favorite.favoriteId,
                  }}
                  onTagClick={clickTagCallback}
                  onMankaClick={onCoverClick}
                  deleteFavorite={deleteFavorite}
                  key={`${favorite.favoriteId}-${index}`}
                />
              ),
          )}
        </ImageList>
        {!hasMore && (
          <Box textAlign="center" p={2}>
            <Typography>没有更多内容了</Typography>
          </Box>
        )}
      </Container>
    </>
  );
}
