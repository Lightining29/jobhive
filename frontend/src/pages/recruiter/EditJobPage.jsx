import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { recruiterService } from '../../services';
import PostJobPage from './PostJobPage';

const EditJobPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await recruiterService.myJobs({ page: 1, limit: 100 });
        const found = data.jobs.find((j) => j._id === id);
        if (!found) {
          toast.error('Job not found');
          return;
        }
        setJob(found);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16"><div className="card p-8 skeleton h-96" /></div>;
  if (!job) return null;
  return <PostJobPage editJob={job} />;
};

export default EditJobPage;
