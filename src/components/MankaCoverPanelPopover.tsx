import { Card, CardMedia, Popover, type PopoverProps } from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import errorImg from '../assets/images/404.png';
import loadImg from '../assets/images/anime_loading.gif';
import type { MankaArchive } from '../types';

export interface MankaPopoverProps {
  //锚点
  anchorEl: HTMLElement | null;

  onClose: () => void;

  manka: MankaArchive;

  //属性
  props?: PopoverProps;
}

export default function MankaCoverPanelPopover(options: MankaPopoverProps) {
  const { anchorEl, props, onClose, manka } = options;
  const navigate = useNavigate();

  const onCoverClick = (manka: MankaArchive) => {
    // setCurrentManka(manka)
    navigate(`/manka/${manka.archiveId}`);
  };

  const CoverPanel: React.FC = () => {
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

    //利用tagGroups 进行渲染
    return (
      <Card key={manka.archiveId}>
        <CardMedia
          component="img"
          alt={manka.archiveName}
          image={imageSrc}
          height={350}
          onClick={(e) => onCoverClick(manka)}
        />
      </Card>
    );
  };

  return (
    <Popover
      id="cover_papover"
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      disableRestoreFocus
      //很重要
      sx={{
        pointerEvents: 'none',
      }}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      {...props}
    >
      <CoverPanel />
    </Popover>
  );
}
