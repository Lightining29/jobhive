import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services';
import { formatDateTime } from '../utils/format';
import { FaBell, FaCircleCheck, FaRegCircle } from 'react-icons/fa6';

const NotificationsPage = () => {
  const { setUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await notificationService.list();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    load();
  }, [load]);

  const readAll = async () => {
    try {
      await notificationService.readAll();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const readOne = async (id) => {
    try {
      await notificationService.readOne(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <FaBell className="h-6 w-6 text-primary" /> Notifications
        </h1>
        <button onClick={readAll} className="text-sm font-medium text-primary hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-4 skeleton h-20" />)
          : notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => readOne(n._id)}
                className={`card card-hover w-full text-left p-4 flex items-start gap-3 ${n.read ? 'opacity-70' : 'border-accent/60'}`}
              >
                {n.read ? (
                  <FaRegCircle className="h-4 w-4 mt-0.5 text-gray-300 shrink-0" />
                ) : (
                  <FaCircleCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-sm text-muted mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
              </button>
            ))}
        {!loading && notifications.length === 0 && (
          <div className="card p-10 text-center text-muted">
            <FaBell className="h-8 w-8 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
