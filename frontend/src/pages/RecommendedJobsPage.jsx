import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { jobService } from '../services';
import JobCard from '../components/jobs/JobCard';
import { useAuth } from '../context/AuthContext';
import { useInfiniteScroll } from '../hooks';
import { LoadingJobs, EmptyState } from '../components/ui/States';

const RecommendedJobsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadPage = useCallback(async (pageNum, append = false) => {
    const fn = append ? setLoadingMore : setLoading;
    fn(true);
    try {
      const { data } = await jobService.recommendations({ page: pageNum, limit: 12 });
      setJobs((prev) => (append ? [...prev, ...data.jobs] : data.jobs));
      setTotal(data.pagination.total);
      setHasMore(data.pagination.hasNext);
      setPage(data.pagination.page);
    } catch (err) {
      toast.error(err.message);
    } finally {
      fn(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  const loadMore = useCallback(() => loadPage(page + 1, true), [loadPage, page]);
  const sentinelRef = useInfiniteScroll(loadMore, { hasMore, loading: loadingMore });

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="card">
          <EmptyState
            icon={FaWandMagicSparkles}
            title="Login to see recommendations"
            description="Create a profile with your skills and we'll match you with the perfect jobs."
            action={<Link to="/auth/login" className="btn-primary">Login</Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
            <FaWandMagicSparkles className="h-5 w-5 text-ink" />
          </span>
          AI Recommended Jobs
        </h1>
        <p className="text-muted mt-2">
          {total} jobs matched to your profile based on your skills, experience, salary, and location preferences.
        </p>
      </div>

      {loading ? (
        <LoadingJobs count={6} />
      ) : jobs.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FaWandMagicSparkles}
            title="No recommendations yet"
            description="Add skills and preferences to your profile to unlock AI-powered job matches."
            action={<Link to="/candidate/profile" className="btn-primary">Complete your profile</Link>}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} match={job.match?.score} />
            ))}
          </div>
          {loadingMore && (
            <div className="flex justify-center py-6">
              <div className="h-8 w-8 rounded-full border-4 border-line border-t-accent animate-spin" />
            </div>
          )}
          <div ref={sentinelRef} />
          {!hasMore && jobs.length > 0 && (
            <p className="text-center text-sm text-muted py-8">You've seen all {total} recommended jobs.</p>
          )}
        </>
      )}
    </div>
  );
};

export default RecommendedJobsPage;
