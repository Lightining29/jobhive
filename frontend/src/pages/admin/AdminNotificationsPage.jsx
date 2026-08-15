import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaBell,
  FaPen,
  FaBullhorn,
  FaEnvelope,
  FaMobileScreen,
  FaCode,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import Modal from '../../components/ui/Modal';

const AdminNotificationsPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Template Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTpl, setEditingTpl] = useState(null);
  const [tplForm, setTplForm] = useState({
    title: '',
    subject: '',
    emailBody: '',
    inAppBody: '',
  });

  // Broadcast Modal
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetRole: 'all',
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.templates();
      setTemplates(data.templates || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenEdit = (tpl) => {
    setEditingTpl(tpl);
    setTplForm({
      title: tpl.title,
      subject: tpl.subject,
      emailBody: tpl.emailBody,
      inAppBody: tpl.inAppBody,
    });
    setEditModalOpen(true);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateTemplate(editingTpl._id, tplForm);
      toast.success('Template updated successfully');
      setEditModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      const { data } = await adminService.broadcastNotification(broadcastForm);
      toast.success(data.message || 'Broadcast sent successfully');
      setBroadcastOpen(false);
      setBroadcastForm({ title: '', message: '', targetRole: 'all' });
    } catch (err) {
      toast.error(err.message || 'Failed to send broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <DashboardLayout title="Notification & Email Templates" subtitle="Customize transactional emails, trial expiry reminders, and broadcast announcements" navItems={adminNavItems}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Configure automated system templates with dynamic merge variables (e.g. <code>&#123;&#123;userName&#125;&#125;</code>, <code>&#123;&#123;planName&#125;&#125;</code>).
          </p>
          <button
            onClick={() => setBroadcastOpen(true)}
            className="btn-primary !py-2 !px-4 text-xs font-semibold gap-2 rounded-xl"
          >
            <FaBullhorn className="h-3 w-3" /> Send Broadcast Message
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-6 skeleton h-64" />)
          ) : templates.length === 0 ? (
            <div className="col-span-full card p-8 text-center text-muted">No templates found.</div>
          ) : (
            templates.map((tpl) => (
              <div key={tpl._id} className="card p-6 flex flex-col justify-between hover:border-primary-500/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-primary-600 bg-primary-500/10 px-2 py-0.5 rounded uppercase">
                      {tpl.event?.replace(/_/g, ' ')}
                    </span>
                    <span className="badge badge-success text-[10px]">Active</span>
                  </div>

                  <h3 className="font-bold text-base text-ink mb-1">{tpl.title}</h3>
                  <div className="text-xs text-muted mb-3 flex items-center gap-1.5">
                    <FaEnvelope className="text-primary-500 h-3 w-3" /> Subject: <span className="text-ink font-medium">{tpl.subject}</span>
                  </div>

                  <div className="p-3 bg-surface-sunken/40 rounded-xl border border-line text-xs space-y-2">
                    <div>
                      <span className="font-bold text-muted uppercase text-[10px] block">In-App Notification:</span>
                      <p className="text-ink mt-0.5 line-clamp-2">{tpl.inAppBody}</p>
                    </div>
                  </div>

                  {tpl.variablesAvailable?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {tpl.variablesAvailable.map((v) => (
                        <span key={v} className="bg-surface-sunken border border-line text-[10px] font-mono px-1.5 py-0.5 rounded text-muted">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-line flex justify-end">
                  <button onClick={() => handleOpenEdit(tpl)} className="btn-outline !py-1.5 !px-3 text-xs font-semibold">
                    <FaPen className="inline mr-1" /> Edit Template
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Edit Template */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Template: ${editingTpl?.title}`}>
        <form onSubmit={handleSaveTemplate} className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Email Subject *</label>
            <input
              required
              value={tplForm.subject}
              onChange={(e) => setTplForm({ ...tplForm, subject: e.target.value })}
              className="input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Email Message Body *</label>
            <textarea
              required
              rows={5}
              value={tplForm.emailBody}
              onChange={(e) => setTplForm({ ...tplForm, emailBody: e.target.value })}
              className="input text-sm font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">In-App Short Alert Body *</label>
            <textarea
              required
              rows={2}
              value={tplForm.inAppBody}
              onChange={(e) => setTplForm({ ...tplForm, inAppBody: e.target.value })}
              className="input text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setEditModalOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary !py-2 text-xs font-bold">
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Send Broadcast Notification */}
      <Modal isOpen={broadcastOpen} onClose={() => setBroadcastOpen(false)} title="Send Platform Announcement">
        <form onSubmit={handleSendBroadcast} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Target Audience</label>
            <select
              value={broadcastForm.targetRole}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
              className="input text-sm"
            >
              <option value="all">All Registered Users</option>
              <option value="employers">Employers / Recruiters Only</option>
              <option value="candidates">Job Seekers Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Announcement Title *</label>
            <input
              required
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              placeholder="e.g. Weekend Flash Sale: 50% Off All Postings!"
              className="input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Message Content *</label>
            <textarea
              required
              rows={3}
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
              placeholder="Write the message that will pop up in user notifications..."
              className="input text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setBroadcastOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={broadcasting} className="btn-primary !py-2 text-xs font-bold">
              {broadcasting ? 'Broadcasting...' : 'Send Broadcast'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminNotificationsPage;
