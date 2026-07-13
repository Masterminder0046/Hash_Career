import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationApi } from '../../services/api';
import { Notification } from '../../types';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const iconMap = { info: Info, warning: AlertTriangle, success: CheckCircle, error: XCircle };
const colorMap = { info: 'text-blue-500', warning: 'text-amber-500', success: 'text-emerald-500', error: 'text-red-500' };
const bgMap = { info: 'bg-blue-50 dark:bg-blue-900/10', warning: 'bg-amber-50 dark:bg-amber-900/10', success: 'bg-emerald-50 dark:bg-emerald-900/10', error: 'bg-red-50 dark:bg-red-900/10' };

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const res = await notificationApi.getAll();
      if (res.data.success) setNotifications(res.data.data.notifications || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifications.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch { }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAsRead('all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch { }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
          <p className="text-slate-400 mt-1">Stay updated with your placement journey</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && !loading && (
          <div className="glass-card p-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400">No notifications yet</p>
          </div>
        )}
        {notifications.map((n, i) => {
          const Icon = iconMap[n.type];
          return (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all ${!n.isRead ? `border-l-4 border-l-indigo-500 ${bgMap[n.type]}` : ''}`}
              onClick={() => !n.isRead && markAsRead(n._id)}
            >
              <div className={`p-2 rounded-xl ${bgMap[n.type]}`}>
                <Icon className={`w-5 h-5 ${colorMap[n.type]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${!n.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString()}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${bgMap[n.type]} ${colorMap[n.type]}`}>{n.category}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
