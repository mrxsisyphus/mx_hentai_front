import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import errorImg from '../../assets/images/404.png';
import loadImg from '../../assets/images/anime_loading.gif';
import MankaTagsPanelPopover from '../../components/MankaTagsPanelPopover';
import type { MankaArchive, MankaArchiveTag } from '../../types';

export interface MankaImgListPageProps {
  mankaData: MankaArchive[];

  //onMankaClick?:(event:React.MouseEvent<HTMLTableRowElement, MouseEvent>,manka:MankaArchive) => void

  //onTitleMouseEnter?: (event:React.MouseEvent<HTMLElement>,manka:MankaArchive) => void

  //onTitleMouseLeave?:(event:React.MouseEvent<HTMLElement>,manka:MankaArchive) => void

  clickTagCallback?: (tag: MankaArchiveTag) => void;

  addToFavorite?: (archive: MankaArchive) => void;

  deleteFavorite?: (favoriteId: string) => void;
}


export default function MankaImgListPage(options: MankaImgListPageProps) {
  const { mankaData, clickTagCallback, addToFavorite, deleteFavorite } =
    options;
  
  const navigate = useNavigate();

  // 当前的manka
  // const [currentManka, setCurrentManka] = useState<MankaArchive>();

  const onCoverClick = (manka: MankaArchive) => {
    // // setCurrentManka(manka)
    // console.log(`你点击了漫画：${manka.archiveName}`);
    // //跳转
    // window.location.href = `/manka/${manka.archiveId}`
    navigate(`/manka/${manka.archiveId}`);
  };

  // 自定义的 ComicItem 组件，包含标题、图片和其他信息
  const MankaItem: React.FC<{ manka: MankaArchive }> = ({ manka }) => {
    // const tagsInfo = manka.tags ? manka.tags.map(tag => tag.tagValue).join(",") : ""
    // tagsPanelPopoverAnchor
    const [tagsPanelPopoverAnchor, setTagsPanelPopoverAnchor] =
      useState<HTMLElement | null>(null);

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

    const onTagsMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
      // setCurrentManka(manka)
      setTagsPanelPopoverAnchor(event.currentTarget);
    };
    //
    // const onTagsMouseLeave = (event: React.MouseEvent<HTMLElement>, manka: MankaArchive) => {
    //     setCurrentManka(manka)
    //     setTagsPanelPopoverAnchor(null)
    // }
    return (
      <>
        <ImageListItem key={manka.archiveId}>
          <img
            alt={manka.archiveName}
            src={imageSrc}
            style={{ cursor: 'pointer' }}
            onClick={() => onCoverClick(manka)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onCoverClick(manka);
              }
            }}
            loading="lazy"
          />
          <ImageListItemBar
            sx={{ whiteSpace: 'normal' }}
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
                    onClick={() =>
                      deleteFavorite && manka?.belongFavoriteId
                        ? deleteFavorite(manka?.belongFavoriteId)
                        : null
                    }
                  >
                    <StarIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={'加入收藏'}>
                  <IconButton
                    aria-label="settings"
                    sx={{ color: 'green' }}
                    onClick={() =>
                      addToFavorite ? addToFavorite(manka) : null
                    }
                  >
                    <StarBorderIcon />
                  </IconButton>
                </Tooltip>
              )
            }
            actionPosition="left"
          />
          <ImageListItemBar
            title={
              manka.tags && (
                <Typography fontSize={'small'} onMouseEnter={onTagsMouseEnter}>
                  <MankaTagsPanelPopover
                    anchorEl={tagsPanelPopoverAnchor}
                    onClose={() => setTagsPanelPopoverAnchor(null)}
                    manka={manka}
                    clickTagCallback={clickTagCallback}
                  />
                  {manka.tags.length > 3
                    ? `${manka.tags
                        .slice(0, 3)
                        .map((tag) => tag.tagValue)
                        .join(',')}...`
                    : manka.tags.map((tag) => tag.tagValue).join(',')}
                </Typography>
              )
            }
          />
        </ImageListItem>
      </>
    );
  };

  return (
    <React.Fragment>
      <Paper sx={{ width: '100%', overflowY: 'auto', maxHeight: '75vh' }}>
        <ImageList
          variant="standard"
          // rowHeight={500}
          cols={5}
          gap={10}
        >
          {mankaData.map((manka) => (
            <MankaItem manka={manka} key={manka.archiveId} />
          ))}
        </ImageList>
      </Paper>
    </React.Fragment>
  );
}
