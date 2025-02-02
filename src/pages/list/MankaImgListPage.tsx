import { ImageList } from '@mui/material';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import type { MankaArchive, MankaArchiveTag } from '../../types';
import MankaImgItem from './MankaImgItem';

interface MankaImgListPageProps {
  mankaData: MankaArchive[];
  onTagClick: (tag: MankaArchiveTag) => void;
  onMankaClick?: (manka: MankaArchive) => void;
  addToFavorite: (manka: MankaArchive) => Promise<void>;
  deleteFavorite: (favoriteId: string) => Promise<void>;
}

const MankaImgListPage: React.FC<MankaImgListPageProps> = ({
  mankaData,
  onTagClick,
  onMankaClick,
  addToFavorite,
  deleteFavorite,
}) => {
  return (
    <ImageList cols={5} gap={10}>
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
    </ImageList>
  );
};

export default MankaImgListPage;
