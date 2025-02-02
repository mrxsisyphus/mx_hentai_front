import {
  Box,
  Card,
  CardMedia,
  CircularProgress,
  Typography,
} from '@mui/material';
// src/components/ArchiveItemForPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import errorImg from '@/assets/images/404.png';
import type { ArchiveItem } from '@/types';
import { sizeToString } from '../../utils/datetime';
import { getImgLink } from './store';

interface ArchiveItemForPageProps {
  archiveItem: ArchiveItem;
  index: number;
  mankaId: string | undefined;
  imgSpec: string;
  totalPage: number;
  onClick?: () => void;
}

const ArchiveItemForPage: React.FC<ArchiveItemForPageProps> = React.memo(
  ({ archiveItem, index, mankaId, imgSpec, totalPage, onClick }) => {
    const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    const getImgUrl = useCallback(() => {
      if (!mankaId) return errorImg;
      return getImgLink(mankaId, archiveItem.archiveItemIndex, imgSpec);
    }, [mankaId, imgSpec, archiveItem.archiveItemIndex]);

    useEffect(() => {
      if (!mankaId) {
        setImageSrc(errorImg);
        setLoading(false);
        return;
      }

      setLoading(true);
      const img = new Image();
      const url = getImgUrl();
      img.src = url;

      img.onload = () => {
        setImageSrc(url);
        setLoading(false);
      };

      img.onerror = () => {
        setImageSrc(errorImg);
        setLoading(false);
      };

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [mankaId, getImgUrl]);

    return (
      <Box display="flex" flexDirection="column" height="100%">
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
          <Typography variant="subtitle2">
            {`${archiveItem.archiveItemName} :: ${sizeToString(archiveItem.archiveItemSize)} :: ${index + 1}/${totalPage}`}
          </Typography>
        </Box>
        <Card
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {(loading || !imageSrc) && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress color="inherit" />
            </Box>
          )}
          <CardMedia
            component="img"
            alt={archiveItem.archiveItemName}
            image={imageSrc}
            loading="lazy"
            onClick={onClick}
            sx={{
              cursor: 'pointer',
              width: '100%',
              height: '100%',
              opacity: loading ? 0.5 : 1,
            }}
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
