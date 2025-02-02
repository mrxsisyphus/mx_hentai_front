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
  onPageChange: (newPage: number) => void; // when change page callback to pagejumper
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
      [onPageChange],
    );

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        aria-label="page-img-viewer"
      >
        <Box aria-label="page-img-viewer-pagination">
          <Pagination
            count={totalPage}
            page={currentPage}
            onChange={pageChange}
            showFirstButton
            showLastButton
          />
        </Box>
        <Box aria-label="page-img-viewer-content" flex={1}>
          {sortedImgItems[currentPage - 1] && (
            <ArchiveItemForPage
              archiveItem={sortedImgItems[currentPage - 1]}
              index={currentPage - 1}
              mankaId={mankaId}
              imgSpec={imgSpec}
              totalPage={totalPage}
              onClick={() => onPageChange(currentPage + 1)}
            />
          )}
        </Box>
        <Box aria-label="page-img-viewer-pagination">
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
