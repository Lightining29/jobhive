import { useCallback, useRef, useEffect, useState } from 'react';

export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export const useInfiniteScroll = (callback, { hasMore, loading, threshold = 300 }) => {
  const sentinelRef = useRef(null);

  const onScroll = useCallback(() => {
    if (!sentinelRef.current || loading || !hasMore) return;
    const rect = sentinelRef.current.getBoundingClientRect();
    if (rect.top < window.innerHeight + threshold) {
      callback();
    }
  }, [callback, loading, hasMore, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return sentinelRef;
};

export const useLocalStorage = (key, initial) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

export const useTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | JobHive` : 'JobHive - Find Your Dream Job';
  }, [title]);
};

export const useQueryParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(searchParams.entries());
};
