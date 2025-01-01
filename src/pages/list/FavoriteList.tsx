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
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useNavigate } from 'react-router-dom';
import errorImg from '../../assets/images/404.png';
import loadImg from '../../assets/images/anime_loading.gif';
import MankaTagsPanelPopover from '../../components/MankaTagsPanelPopover';
import API from '../../middleware/api';
import type { Favorite, MankaArchive, MankaArchiveTag } from '../../types';
import type { Response } from '../../types/response';
import { ImgRankField, ImgRankMode } from '../detail/types';
import { RankField, RankMode } from './types';

const preloadPage = 8;

export default function FavoriteList() {
  const [favoriteList, setFavoriteList] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchFavoriteList();
  }, []);

  const fetchFavoriteList = async () => {
    setLoading(true);
    try {
      const {
        data: { data },
      } = await API.get<Response<Favorite[]>>('/favorite/list');
      setFavoriteList(data);
    } catch (e) {
      console.error('err', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const deleteFavorite = async (favorite: Favorite) => {
    console.log('deleteFavorite', favorite);
    try {
      await API.get<Response<any>>(`/favorite/remove/${favorite.favoriteId}`);
      fetchFavoriteList();
    } catch (e) {
      console.error('err', e);
      enqueueSnackbar(`${e}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onCoverClick = (manka: MankaArchive) => {
    // setCurrentManka(manka)
    // console.log(`你点击了漫画：${manka.archiveName}`);
    // //跳转
    // window.location.href = `/manka/${manka.archiveId}`;

    navigate(`/manka/${manka.archiveId}`);
  };

  // 自定义的 ComicItem 组件，包含标题、图片和其他信息
  const FavoriteView: React.FC<{ favorite: Favorite }> = ({ favorite }) => {
    const navigate = useNavigate();
    // const tagsInfo = manka.tags ? manka.tags.map(tag => tag.tagValue).join(",") : ""
    // tagsPanelPopoverAnchor
    const [tagsPanelPopoverAnchor, setTagsPanelPopoverAnchor] =
      useState<HTMLElement | null>(null);

    const [imageSrc, setImageSrc] = useState<string>(loadImg);
    useEffect(() => {
      const img = new Image();
      img.src = favorite.archive.archiveCoverUrl;

      // loaded的钩子
      img.onload = () => {
        setImageSrc(favorite.archive.archiveCoverUrl);
      };

      img.onerror = () => {
        // Setting to an actual image so CSS styling works consistently
        setImageSrc(errorImg);
      };

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [favorite.archive.archiveCoverUrl]);

    const onTagsMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
      setTagsPanelPopoverAnchor(event.currentTarget);
    };

    const clickTagCallback = (tag: MankaArchiveTag) => {
      console.log('clickTagCallback', tag);
      navigate(`/?kw=${tag.tagName}:${tag.tagValue}`); // Navigate to MankaListPage with kw query parameter
    };

    return (
      <>
        <ImageListItem key={favorite.archive.archiveId}>
          <img
            alt={favorite.archive.archiveName}
            src={imageSrc}
            style={{ cursor: 'pointer' }}
            onClick={() => onCoverClick(favorite.archive)}
            loading="lazy"
          />
          <ImageListItemBar
            sx={{ whiteSpace: 'normal' }}
            title={
              <Tooltip title={favorite.archive.archiveName}>
                <Typography fontSize={'small'}>
                  {favorite.archive.archiveName.length > 50
                    ? favorite.archive.archiveName.slice(0, 50) + '...'
                    : favorite.archive.archiveName}
                </Typography>
              </Tooltip>
            }
            position="top"
            actionIcon={
              <Tooltip title={'取消收藏'}>
                <IconButton
                  aria-label="settings"
                  sx={{ color: 'red' }}
                  onClick={async () =>
                    favorite.archive.belongFavoriteId
                      ? deleteFavorite(favorite)
                      : null
                  }
                >
                  <StarIcon />
                </IconButton>
              </Tooltip>
            }
            actionPosition="left"
          />
          <ImageListItemBar
            title={
              favorite.archive.tags && (
                <Typography fontSize={'small'} onMouseEnter={onTagsMouseEnter}>
                  <MankaTagsPanelPopover
                    anchorEl={tagsPanelPopoverAnchor}
                    onClose={() => setTagsPanelPopoverAnchor(null)}
                    manka={favorite.archive}
                    clickTagCallback={clickTagCallback}
                  />
                  {favorite.archive.tags.length > 3
                    ? favorite.archive.tags
                        .slice(0, 3)
                        .map((tag) => tag.tagValue)
                        .join(',') + '...'
                    : favorite.archive.tags
                        .map((tag) => tag.tagValue)
                        .join(',')}
                </Typography>
              )
            }
          />
        </ImageListItem>
      </>
    );
  };

  const InfinityImgViewer: React.FC = () => {
    const [loadedItems, setLoadItems] = useState<Favorite[]>([]);
    const loadMoreItems = (page: number) => {
      console.log('loadMore...', page);
      const moreItems = favoriteList.slice(
        loadedItems.length,
        loadedItems.length + preloadPage,
      );
      setLoadItems((prevItems) => [...prevItems, ...moreItems]);
    };
    //
    // useEffect(() => {
    //     if (!mankaArchive) return;
    //     if (loadedItems.length <= 0) return;
    //     const handleScroll = () => {
    //         if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - defaultPageSize) return;
    //         if (loadedItems.length === mankaArchive?.archiveTotalPage) return; // 如果所有的图片都已经被加载，就不再加载更多的图片
    //         loadMoreItems();
    //     };
    //     window.addEventListener('scroll', handleScroll);
    //     return () => window.removeEventListener('scroll', handleScroll);
    // }, [loadedItems]);
    return (
      <>
        <InfiniteScroll
          pageStart={0}
          loadMore={loadMoreItems} //loadMore
          initialLoad={true}
          loader={<CircularProgress key={'loading'} />}
          hasMore={loadedItems.length < favoriteList.length}
          threshold={600}
          useWindow={false}
        >
          {loadedItems.map((favorite, index) => (
            <FavoriteView favorite={favorite} key={favorite.favoriteId} />
          ))}
        </InfiniteScroll>
      </>
    );
  };

  return (
    <>
      <Container>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" justifyContent="center">
                <Typography>总收藏数： {favoriteList?.length || 0}</Typography>
              </Box>
            </Box>
            <Box
              sx={{
                height: '100vh', // 设置高度为视口的高度
                overflowY: 'auto', // 设置垂直滚动
              }}
            >
              <ImageList
                variant="standard"
                // rowHeight={500}
                cols={5}
                gap={10}
              >
                {favoriteList?.map((favorite) => (
                  <FavoriteView favorite={favorite} key={favorite.favoriteId} />
                ))}
              </ImageList>

              {/* <InfinityImgViewer /> */}
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
