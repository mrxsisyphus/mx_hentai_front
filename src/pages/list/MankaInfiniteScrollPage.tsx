import { Box, CircularProgress } from '@mui/material';
import type React from 'react';
import { useEffect } from 'react';
import type { MankaArchive, MankaArchiveTag } from '../../types';
import MankaImgItem from './MankaImgItem';

interface MankaInfiniteScrollPageProps {
  mankaData: MankaArchive[];
  onTagClick: (tag: MankaArchiveTag) => void;
  onMankaClick?: (manka: MankaArchive) => void;
  addToFavorite: (manka: MankaArchive) => Promise<void>;
  deleteFavorite: (favoriteId: string) => Promise<void>;
  onPageChange: (page: number) => void;
  currentPage: number;
  isLoading: boolean;
}

const MankaInfiniteScrollPage: React.FC<MankaInfiniteScrollPageProps> = ({
  mankaData,
  onTagClick,
  onMankaClick,
  addToFavorite,
  deleteFavorite,
  onPageChange,
  currentPage,
  isLoading,
}) => {
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        !isLoading
      ) {
        onPageChange(currentPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, currentPage, onPageChange]);

  return (
    <Box>
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
        gap={2}
      >
        {mankaData.map((manka) => (
          <MankaImgItem
            manka={manka}
            onTagClick={onTagClick}
            onMankaClick={onMankaClick}
            addToFavorite={addToFavorite}
            deleteFavorite={deleteFavorite}
            key={manka.archiveId}
          />
        ))}
      </Box>
      {isLoading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default MankaInfiniteScrollPage;
