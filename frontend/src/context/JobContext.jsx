import { createContext, useContext, useCallback, useState, useMemo, useEffect } from 'react';
import { jobService } from '../services';

const JobContext = createContext(null);

export const JobProvider = ({ children }) => {
  const [homeData, setHomeData] = useState(() => {
    try {
      const cached = window.sessionStorage.getItem('jobhive_home_data');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [homeLoading, setHomeLoading] = useState(false);

  const loadHome = useCallback(async () => {
    try {
      const { data } = await jobService.home();
      if (data?.sections) {
        setHomeData(data.sections);
        try {
          window.sessionStorage.setItem('jobhive_home_data', JSON.stringify(data.sections));
        } catch {}
      }
    } catch {
      // home feed is non-critical; keep previous data
    } finally {
      setHomeLoading(false);
    }
  }, []);

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
