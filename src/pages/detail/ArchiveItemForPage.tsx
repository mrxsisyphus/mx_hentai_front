import { Box, Card, CardMedia, Typography } from '@mui/material';
// src/components/ArchiveItemForPage.tsx
import React, { useEffect, useState } from 'react';
import errorImg from '../../assets/images/404.png';
import loadImg from '../../assets/images/anime_loading.gif';
import API from '../../middleware/api';
import type { ArchiveItem } from '../../types';
import { sizeToString } from '../../utils/datetime';

interface ArchiveItemForPageProps {
  archiveItem: ArchiveItem;
  index: number;
  mankaId: string | undefined;
  imgSpec: string;
  totalPage: number;
}

const ArchiveItemForPage: React.FC<ArchiveItemForPageProps> = React.memo(
  ({ archiveItem, index, mankaId, imgSpec, totalPage }) => {
    const [imageSrc, setImageSrc] = useState<string>(loadImg);

    const getImgUrl = () => {
      if (!mankaId) return errorImg;
      return `${API.defaults.baseURL}/manka/${mankaId}/${archiveItem.archiveItemIndex}/${imgSpec}/link`;
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
      <Box>
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
          <Typography variant="subtitle2">
            {`${archiveItem.archiveItemName} :: ${sizeToString(archiveItem.archiveItemSize)} :: ${index + 1}/${totalPage}`}
          </Typography>
        </Box>
        <Card>
          <CardMedia
            component="img"
            alt={archiveItem.archiveItemName}
            image={imageSrc}
            loading="lazy"
          />
        </Card>
        <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
          <Typography variant="subtitle2">
            {`${archiveItem.archiveItemName} :: ${sizeToString(archiveItem.archiveItemSize)} :: ${index + 1}/${totalPage}`}
          </Typography>
        </Box>
      </Box>
    );
  },
);

export default ArchiveItemForPage;
