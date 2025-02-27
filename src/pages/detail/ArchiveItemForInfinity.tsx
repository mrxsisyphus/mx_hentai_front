import { Box, CardMedia, Typography } from '@mui/material';
// src/components/ArchiveItemForInfinity.tsx
import React, { useEffect, useState } from 'react';
import errorImg from '../../assets/images/404.png';
import loadImg from '../../assets/images/anime_loading.gif';
import API from '../../middleware/api';
import type { ArchiveItem } from '../../types';
import { sizeToString } from '../../utils/datetime';
import { BASE_URL } from '@/adapter/http/types';

interface ArchiveItemForInfinityProps {
  archiveItem: ArchiveItem;
  index: number;
  mankaId: string | undefined;
  imgSpec: string;
  totalPage: number;
  id: string;
}

const ArchiveItemForInfinity: React.FC<ArchiveItemForInfinityProps> =
  React.memo(({ archiveItem, index, mankaId, imgSpec, totalPage, id }) => {
    const [imageSrc, setImageSrc] = useState<string>(loadImg);

    const getImgUrl = () => {
      if (!mankaId) return errorImg;
      return `${BASE_URL}/manka/${mankaId}/${archiveItem.archiveItemIndex}/${imgSpec}/link`;
    };

    useEffect(() => {
      if (!mankaId) {
        setImageSrc(errorImg);
        return;
      }
      // 重置为加载图
      setImageSrc(loadImg);
      const img = new Image();
      const url = getImgUrl();
      img.src = url;

      img.onload = () => {
        setImageSrc(url);
      };

      img.onerror = () => {
        setImageSrc(errorImg);
      };

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [mankaId, imgSpec, archiveItem.archiveItemIndex]);

    return (
      <Box mb={2}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
          <Typography variant="subtitle2">
            {`${archiveItem.archiveItemName} :: ${sizeToString(archiveItem.archiveItemSize)} :: ${index + 1}/${totalPage}`}
          </Typography>
        </Box>
        <CardMedia
          component="img"
          alt={archiveItem.archiveItemName}
          image={imageSrc}
          loading="lazy"
          id={id}
        />
      </Box>
    );
  });

export default ArchiveItemForInfinity;
