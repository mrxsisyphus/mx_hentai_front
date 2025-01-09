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
import MankaImgItem from './MankaImgItem';

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
      <Container maxWidth={'xl'}>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Box display="flex" alignItems="center" justifyContent="center">
              <Typography>总收藏数： {favoriteList?.length || 0}</Typography>
            </Box>
            <Box>
              <ImageList variant="standard" cols={5} gap={10}>
                {favoriteList?.map(
                  (favorite) =>
                    // <FavoriteView favorite={favorite} key={favorite.favoriteId} />
                    favorite?.archive && (
                      <MankaImgItem
                        manka={{ ...favorite.archive, belongFavoriteId: favorite.favoriteId }}
                        clickTagCallback={clickTagCallback}
                        onCoverClick={onCoverClick}
                        deleteFavorite={deleteFavorite}
                        key={favorite.archive?.archiveId}
                      />
                    ),
                )}
              </ImageList>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
