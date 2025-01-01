import { Box, CircularProgress } from '@mui/material';
// src/components/InfinityImgViewer.tsx
import React, { useState, useCallback, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import type { ArchiveItem } from '../../types';
import ArchiveItemForInfinity from './ArchiveItemForInfinity';

interface InfinityImgViewerProps {
  mankaId: string | undefined;
  imgSpec: string;
  sortedImgItems: ArchiveItem[];
  currentPage: number;
  onPageChange: (newPage: number) => void;
  preloadPage?: number;
}

const InfinityImgViewer: React.FC<InfinityImgViewerProps> = React.memo(
  ({
    mankaId,
    imgSpec,
    sortedImgItems,
    currentPage,
    onPageChange,
    preloadPage = 8,
  }) => {
    const [loadedItems, setLoadedItems] = useState<ArchiveItem[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const loadMoreItems = useCallback(
      (page: number) => {
        const start = loadedItems.length;
        const end = start + preloadPage;
        const moreItems = sortedImgItems.slice(start, end);
        setLoadedItems((prevItems) => [...prevItems, ...moreItems]);

        if (end >= sortedImgItems.length) {
          setHasMore(false);
        }
      },
      [loadedItems.length, preloadPage, sortedImgItems],
    );

    // Effect to handle jump to a specific page
    useEffect(() => {
      if (currentPage > loadedItems.length) {
        const additionalPages = currentPage - loadedItems.length;
        const additionalItems = sortedImgItems.slice(
          loadedItems.length,
          loadedItems.length + additionalPages * preloadPage,
        );
        setLoadedItems((prevItems) => [...prevItems, ...additionalItems]);

        if (
          loadedItems.length + additionalItems.length >=
          sortedImgItems.length
        ) {
          setHasMore(false);
        }
      }
    }, [currentPage, loadedItems.length, preloadPage, sortedImgItems]);

    // Scroll to the current page when loadedItems updates
    useEffect(() => {
      if (currentPage > 0 && loadedItems.length >= currentPage) {
        const element = document.getElementById(`page-${currentPage}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, [currentPage, loadedItems]);

    return (
      <Box
        sx={{
          height: '80vh', // Adjust height as needed
          overflowY: 'auto',
          mt: 2,
        }}
      >
        <InfiniteScroll
          pageStart={0}
          loadMore={loadMoreItems}
          initialLoad={true}
          loader={
            <Box display="flex" justifyContent="center" key="loader">
              <CircularProgress />
            </Box>
          }
          hasMore={hasMore}
          threshold={600}
          useWindow={false}
        >
          {loadedItems.map((archiveItem, index) => (
            <ArchiveItemForInfinity
              archiveItem={archiveItem}
              index={index}
              mankaId={mankaId}
              imgSpec={imgSpec}
              totalPage={sortedImgItems.length}
              key={archiveItem.archiveItemPath}
              id={`page-${index + 1}`}
            />
          ))}
        </InfiniteScroll>
      </Box>
    );
  },
);

export default InfinityImgViewer;
