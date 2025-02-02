import { useCallback, useEffect, useState } from 'react';
import type { MankaArchive, MankaArchiveTag } from '../../types';
import errorImg from '../../assets/images/404.png';
import loadImg from '../../assets/images/anime_loading.gif';
import {
  Box,
  IconButton,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MankaTagsPanelPopover from '../../components/MankaTagsPanelPopover';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
export interface MankaImageProps {
  manka: MankaArchive;
  onTagClick?: (tag: MankaArchiveTag) => void;
  onMankaClick?: (manka: MankaArchive) => void;
  addToFavorite?: (archive: MankaArchive) => void;
  deleteFavorite?: (favoriteId: string) => void;
}

export default function MankaImgItem(props: MankaImageProps) {
  const { manka, onTagClick, onMankaClick, addToFavorite, deleteFavorite } =
    props;
  // tagsPanelPopoverAnchor
  const [tagsPanelPopoverAnchor, setTagsPanelPopoverAnchor] =
    useState<HTMLElement | null>(null);
  //image
  const [imageSrc, setImageSrc] = useState<string>(loadImg);
  useEffect(() => {
    const img = new Image();
    img.src = manka.archiveCoverUrl;

    // loaded的钩子
    img.onload = () => {
      setImageSrc(manka.archiveCoverUrl);
    };

    img.onerror = () => {
      // Setting to an actual image so CSS styling works consistently
      setImageSrc(errorImg);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [manka.archiveCoverUrl]);

  const onTagsMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      // setCurrentManka(manka)
      setTagsPanelPopoverAnchor(event.currentTarget);
    },
    [],
  );

  return (
    <>
      <ImageListItem key={manka.archiveId}>
        <img
          alt={manka.archiveName}
          src={imageSrc}
          style={{
            cursor: 'pointer',
            objectFit: 'contain',
          }}
          onClick={() => onMankaClick?.(manka)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onMankaClick?.(manka);
            }
          }}
          loading="lazy"
        />
        <ImageListItemBar
          title={
            <Tooltip title={manka.archiveName}>
              <Typography fontSize={'small'}>
                {manka.archiveName.length > 50
                  ? `${manka.archiveName.slice(0, 50)}...`
                  : manka.archiveName}
              </Typography>
            </Tooltip>
          }
          position="top"
          actionIcon={
            manka?.belongFavoriteId ? (
              <Tooltip title={'取消收藏'}>
                <IconButton
                  aria-label="settings"
                  sx={{ color: 'red' }}
                  size="small"
                  onClick={() =>
                    deleteFavorite && manka?.belongFavoriteId
                      ? deleteFavorite(manka?.belongFavoriteId)
                      : null
                  }
                >
                  <StarIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title={'加入收藏'}>
                <IconButton
                  aria-label="settings"
                  sx={{ color: 'green' }}
                  size="small"
                  onClick={() => (addToFavorite ? addToFavorite(manka) : null)}
                >
                  <StarBorderIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          }
          actionPosition="left"
        />
        <ImageListItemBar
          title={
            <Box>
              <Box
                sx={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    width: `${(manka.lastReadPage / (manka.archiveTotalPage || 1)) * 100}%`,
                    height: '100%',
                    backgroundColor: '#4caf50',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                  }}
                />
              </Box>
              {manka.tags && (
                <Typography fontSize="small" onMouseEnter={onTagsMouseEnter}>
                  <MankaTagsPanelPopover
                    anchorEl={tagsPanelPopoverAnchor}
                    onClose={() => setTagsPanelPopoverAnchor(null)}
                    manka={manka}
                    clickTagCallback={onTagClick}
                  />
                  {manka.tags.length > 3
                    ? `${manka.tags
                        .slice(0, 3)
                        .map((tag) => tag.tagValue)
                        .join(',')}...`
                    : manka.tags.map((tag) => tag.tagValue).join(',')}
                </Typography>
              )}
            </Box>
          }
          position="bottom"
        />
      </ImageListItem>
    </>
  );
}
