import { createContext, useContext, useCallback, useState, useMemo, useEffect } from 'react';
import { jobService } from '../services';

const JobContext = createContext(null);

export const JobProvider = ({ children }) => {
  const [homeData, setHomeData] = useState(null);
  const [homeLoading, setHomeLoading] = useState(true);

  const loadHome = useCallback(async () => {
    setHomeLoading(true);
    try {
      const { data } = await jobService.home();
      setHomeData(data.sections);
    } catch {
      // home feed is non-critical; keep previous data
    } finally {
      setHomeLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  const value = useMemo(
    () => ({ homeData, homeLoading, loadHome }),
    [homeData, homeLoading, loadHome]
  );

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobs = () => {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error('useJobs must be used within JobProvider');
  return ctx;
};
