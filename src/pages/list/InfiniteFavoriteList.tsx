import React, { useState, useEffect, useRef, useCallback } from 'react';

const PAGE_SIZE = 10;

export default function InfiniteFavoriteList() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const containerRef = useRef(null);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(page);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // 引入pageRef 是为了让fetchData 不依赖于page
  //让fetchData的函数不发生改变  从而让整个依赖链都不需要改变
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const fetchData = useCallback(async () => {
    if (isLoadingRef.current) return;
    setIsLoading(true);
    setError(null);
    console.log('fetchData', pageRef.current);
    try {
      const data = await new Promise((resolve) => {
        setTimeout(() => {
          const data = [];
          const currentPage = pageRef.current;
          for (
            let i = currentPage * PAGE_SIZE - PAGE_SIZE;
            i < currentPage * PAGE_SIZE;
            i++
          ) {
            data.push({ id: i, name: `Item ${i}` });
          }
          resolve(data);
        }, 1000);
      });

      setItems((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollThreshold = 50;
    const { scrollTop, scrollHeight, clientHeight } = container;
    // console.log('[scroll debug ]', scrollTop, scrollHeight, clientHeight);
    if (
      scrollTop + clientHeight >= scrollHeight - scrollThreshold &&
      !isLoadingRef.current
    ) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    console.log('add event listener');
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    console.log('init');
    fetchData();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            style={{ padding: '20px', borderBottom: '1px solid #eee' }}
          >
            {item.name}
          </li>
        ))}
      </ul>
      {isLoading && <p style={{ padding: '20px' }}>Loading more items...</p>}
      {error && (
        <p style={{ color: 'red', padding: '20px' }}>Error: {error.message}</p>
      )}
    </div>
  );
}
