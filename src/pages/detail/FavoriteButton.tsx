import { Button, ButtonGroup } from '@mui/material';
// components/FavoriteButton.tsx
import React from 'react';

interface FavoriteButtonProps {
  favoriteId?: string;
  onAdd: () => Promise<void>;
  onRemove: () => Promise<void>;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = React.memo(
  ({ favoriteId, onAdd, onRemove }) => {
    return (
      <ButtonGroup
        variant="outlined"
        aria-label="outlined button group"
        size="small"
      >
        <Button size="small" disabled={!!favoriteId} onClick={onAdd}>
          加入收藏
        </Button>
        <Button size="small" disabled={!favoriteId} onClick={onRemove}>
          取消收藏
        </Button>
      </ButtonGroup>
    );
  },
);

export default FavoriteButton;
