import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  FaBuilding, FaBriefcase, FaUsers, FaGaugeHigh, FaPlus, FaCalendarDays,
  FaDownload, FaCircleCheck, FaCircleXmark, FaUserTie, FaEnvelope, FaPhone,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { recruiterService } from '../../services';
import { STATUS_COLORS, capitalize, formatDateTime } from '../../utils/format';

const navItems = [
  { to: '/recruiter/dashboard', label: 'Overview', icon: FaGaugeHigh },
  { to: '/recruiter/company', label: 'Company Profile', icon: FaBuilding },
  { to: '/recruiter/post-job', label: 'Post a Job', icon: FaPlus },
  { to: '/recruiter/my-jobs', label: 'My Jobs', icon: FaBriefcase },
  { to: '/recruiter/applications', label: 'Applications', icon: FaUsers },
];

const STATUS_FILTERS = ['', 'pending', 'shortlisted', 'interview', 'accepted', 'rejected'];

const ApplicantsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [interviewFor, setInterviewFor] = useState(null);

  const { register, handleSubmit, reset } = useForm({ defaultValues: { date: '', mode: 'video', link: '', notes: '' } });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await recruiterService.applications({ page: 1, limit: 50, status: statusFilter || undefined });
      setApplications(data.applications);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, next) => {
    try {
      const { data } = await recruiterService.updateStatus(id, next);
      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const scheduleInterview = async (values) => {
    try {
      const { data } = await recruiterService.scheduleInterview(interviewFor._id, values);
      toast.success('Interview scheduled');
      setInterviewFor(null);
      reset();
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout title="Applications" subtitle="Review and manage candidates" navItems={navItems}>
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`badge py-1.5 px-3 cursor-pointer border ${statusFilter === s ? 'bg-accent text-ink border-accent' : 'bg-white text-muted border-line hover:border-accent'}`}
          >
            {s === '' ? 'All' : capitalize(s)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5 skeleton h-28" />)}</div>
      ) : applications.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          <FaUsers className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-ink mb-1">No applications found</p>
          <p className="text-sm">Applications will appear here when candidates apply to your jobs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  {app.candidate?.avatar ? (
                    <img src={app.candidate.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <span className="h-11 w-11 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold">
                      <FaUserTie className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold">{app.candidate?.name || 'Candidate'}</p>
                    <p className="text-sm text-muted flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1"><FaEnvelope className="h-3 w-3" /> {app.candidate?.email}</span>
                      {app.candidate?.phone && <span className="flex items-center gap-1"><FaPhone className="h-3 w-3" /> {app.candidate.phone}</span>}
                    </p>
                    {app.candidate?.headline && <p className="text-sm text-ink mt-1">{app.candidate.headline}</p>}
                    <p className="text-xs text-muted mt-1">Applied to <span className="font-semibold">{app.job?.jobTitle}</span> on {formatDateTime(app.createdAt)}</p>
                    {app.candidate?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {app.candidate.skills.slice(0, 6).map((s) => <span key={s} className="badge bg-gray-50 text-muted border border-line">{s}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge border ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>{capitalize(app.status)}</span>
                  {app.resumeUrl && (
                    <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn-outline !py-1.5 text-xs">
                      <FaDownload className="h-3 w-3" /> Resume
                    </a>
                  )}
                </div>
              </div>

              {app.interview?.scheduled && app.interview.date && (
                <div className="mt-3 p-3 rounded-xl bg-primary-50 border border-accent/50 text-sm">
                  <span className="font-semibold flex items-center gap-2"><FaCalendarDays className="h-4 w-4 text-primary" /> Interview scheduled</span>
                  <p className="text-muted mt-0.5">{formatDateTime(app.interview.date)} • {capitalize(app.interview.mode)}{app.interview.link ? ` • ${app.interview.link}` : ''}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => setStatus(app._id, 'shortlisted')} className="btn-outline !py-2 text-xs">Shortlist</button>
                <button onClick={() => setInterviewFor(app)} className="btn-primary !py-2 text-xs"><FaCalendarDays className="h-3.5 w-3.5" /> Schedule Interview</button>
                <button onClick={() => setStatus(app._id, 'accepted')} className="btn-outline !py-2 text-xs !border-emerald-300 !text-emerald-700 hover:!bg-emerald-50"><FaCircleCheck className="h-3.5 w-3.5" /> Accept</button>
                <button onClick={() => setStatus(app._id, 'rejected')} className="btn-danger !py-2 text-xs"><FaCircleXmark className="h-3.5 w-3.5" /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {interviewFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setInterviewFor(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit(scheduleInterview)} className="card p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-1">Schedule Interview</h3>
            <p className="text-sm text-muted mb-4">with {interviewFor.candidate?.name} for {interviewFor.job?.jobTitle}</p>
            <div className="space-y-3">
              <div><label className="label">Date & time</label><input type="datetime-local" className="input" required {...register('date')} /></div>
              <div><label className="label">Mode</label><select className="input" {...register('mode')}><option value="video">Video</option><option value="phone">Phone</option><option value="onsite">On-site</option></select></div>
              <div><label className="label">Meeting link</label><input className="input" placeholder="https://meet.google.com/..." {...register('link')} /></div>
              <div><label className="label">Notes</label><textarea rows={3} className="input" {...register('notes')} /></div>
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <button type="button" onClick={() => setInterviewFor(null)} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-primary">Schedule</button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ApplicantsPage;
