import { Box, Pagination } from '@mui/material';
// src/components/PageImgViewer.tsx
import React, { useState, useCallback } from 'react';
import type { ArchiveItem } from '../../types';
import ArchiveItemForPage from './ArchiveItemForPage';

interface PageImgViewerProps {
  mankaId: string | undefined;
  imgSpec: string;
  totalPage: number;
  sortedImgItems: ArchiveItem[];
  currentPage: number;
  onPageChange: (newPage: number) => void;
}

const PageImgViewer: React.FC<PageImgViewerProps> = React.memo(
  ({
    mankaId,
    imgSpec,
    totalPage,
    currentPage,
    sortedImgItems,
    onPageChange,
  }) => {
    // const [page, setPage] = useState<number>(currentPage);

    const pageChange = useCallback(
      (event: React.ChangeEvent<unknown>, value: number) => {
        onPageChange(value);
      },
      [],
    );

    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
          <Pagination
            count={totalPage}
            page={currentPage}
            onChange={pageChange}
            showFirstButton
            showLastButton
          />
        </Box>
        <Box mt={2}>
          {sortedImgItems[currentPage - 1] && (
            <ArchiveItemForPage
              archiveItem={sortedImgItems[currentPage - 1]}
              index={currentPage - 1}
              mankaId={mankaId}
              imgSpec={imgSpec}
              totalPage={totalPage}
            />
          )}
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
          <Pagination
            count={totalPage}
            page={currentPage}
            onChange={pageChange}
            showFirstButton
            showLastButton
          />
        </Box>
      </Box>
    );
  },
);

export default PageImgViewer;
