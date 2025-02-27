import { Container, ImageList, Input, Typography } from '@mui/material';
import { debounce } from 'lodash';
import Box from '@mui/material/Box';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../middleware/api';
import type {
  Favorite,
  MankaArchive,
  MankaArchiveTag,
  PageFavorite,
} from '../../types';
import type { Response } from '../../types/common';
import MankaImgItem from './MankaImgItem';
import { useMediaQuery, useTheme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import httpClient from '@/adapter/http/client';

const preloadPage = 10;
const SCROLL_DEBOUNCE = 200;
const SEARCH_DEBOUNCE = 500;

export default function FavoriteList() {
  const [displayData, setDisplayData] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(page);
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>('');

  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    isLoadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    fetchFavoriteList();
  }, [query]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setDisplayData([]);
      setPage(1);
      setHasMore(true);
      pageRef.current = 1;

      if (containerRef.current) {
        containerRef.current.scrollTo(0, 0);
      }

      fetchFavoriteList();
    }, SEARCH_DEBOUNCE);

    debouncedSearch();
    return () => {
      debouncedSearch.cancel();
      if (isLoadingRef.current) {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };
  }, [query]);

  const fetchFavoriteList = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const currentPage = pageRef.current;
    try {
      // const {
      //   data: { data },
      // } = await API.post<Response<PageFavorite>>('/favorite/page', {
      //   page: { pageNo: currentPage, pageSize: preloadPage },
      //   query,
      // });
      const { data } = await httpClient.post<PageFavorite>('/favorite/page', {
        page: { pageNo: currentPage, pageSize: preloadPage },
        query,
      });

      setDisplayData((prev) =>
        currentPage === 1 ? data.pageData : [...prev, ...data.pageData],
      );
      setHasMore(data.pageTotal > currentPage * preloadPage);
      setPage((prev) => prev + 1);
    } catch (e) {
      enqueueSnackbar(`${e}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [query, loading, hasMore, enqueueSnackbar]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (
      scrollTop + clientHeight >= scrollHeight - 50 &&
      !isLoadingRef.current
    ) {
      fetchFavoriteList();
    }
  }, [fetchFavoriteList]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const debouncedScroll = debounce(handleScroll, SCROLL_DEBOUNCE);
    container.addEventListener('scroll', debouncedScroll);

    return () => {
      container.removeEventListener('scroll', debouncedScroll);
      debouncedScroll.cancel();
    };
  }, [handleScroll]);

  const deleteFavorite = async (favoriteId: string) => {
    console.log('deleteFavorite', favoriteId);
    try {
      // await API.get<Response<void>>(`/favorite/remove/${favoriteId}`);
      await httpClient.get<void>(`/favorite/remove/${favoriteId}`);
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

  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setQuery(value);
    }, SEARCH_DEBOUNCE),
    [],
  );

  return (
    <>
      <Container maxWidth={'xl'}>
        <Box sx={{ p: 2 }}>
          <Input
            fullWidth
            defaultValue={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="搜索收藏..."
            sx={{
              fontSize: isMobile ? '0.875rem' : '1rem',
              '&:before': { borderBottom: 'none' },
              backgroundColor: theme.palette.background.paper,
              borderRadius: 4,
              px: 2,
              py: 1,
            }}
          />
        </Box>
        <Box
          ref={containerRef}
          sx={{
            overflowY: 'auto',
            height: `calc(100vh - ${isMobile ? 120 : 160}px)`,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <ImageList
            variant="masonry"
            cols={isMobile ? 1 : isTablet ? 2 : 5}
            gap={isMobile ? 8 : 16}
            sx={{
              m: 0,
              p: isMobile ? 1 : 2,
              transition: 'all 0.3s ease',
            }}
          >
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
          {loading && (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={isMobile ? 20 : 30} />
            </Box>
          )}
          {!loading && displayData.length === 0 && (
            <Box textAlign="center" p={4}>
              <Typography color="textSecondary">
                {query ? '没有找到相关收藏' : '暂时没有收藏哦'}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
}
