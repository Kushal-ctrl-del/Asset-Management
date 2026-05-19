import React, { useState } from 'react';
import { SectionTitle } from '../components/SectionTitle';
import { cardClass, formatDate } from '../lib/utils';
import { useAuthContext } from '../context/AuthContext';
import { useStore } from '../hooks/useStore';
import { NotificationItem } from '../types';
import { Bell, Check, Calendar, Megaphone, FileText } from 'lucide-react';

export function NotificationsPage() {
  const { currentUser } = useAuthContext();
  const [notifications, setNotifications] = useStore<NotificationItem[]>('abc_notifications', []);
  const [filter, setFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const handleMarkRead = (id: string) => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => {
      if (n.id === id && !n.readBy.includes(currentUser.id)) {
        return { ...n, readBy: [...n.readBy, currentUser.id] };
      }
      return n;
    }));
  };

  const handleMarkAllRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => {
      if (!n.readBy.includes(currentUser.id)) {
        return { ...n, readBy: [...n.readBy, currentUser.id] };
      }
      return n;
    }));
  };

  const filtered = notifications.filter(n => {
    const matchCat = filter === 'All' || n.category === filter;
    const matchDate = !dateFilter || n.date.startsWith(dateFilter);
    return matchCat && matchDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getIcon = (cat: string) => {
    if (cat === 'Event') return <Calendar className="w-5 h-5 text-blue-500" />;
    if (cat === 'Circular') return <FileText className="w-5 h-5 text-purple-500" />;
    if (cat === 'Holiday') return <Megaphone className="w-5 h-5 text-green-500" />;
    return <Bell className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <SectionTitle title="Notifications" subtitle="Stay updated with campus announcements" />
        <button onClick={handleMarkAllRead} className="btn-secondary text-sm">
          Mark all as read
        </button>
      </div>

      <div className={cardClass("flex flex-wrap gap-4 items-center mb-6 bg-soft-bg dark:bg-background")}>
        <div className="flex gap-2">
          {['All', 'Circular', 'Event', 'Holiday'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-card text-slate-600 border border-border hover:bg-muted'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input text-sm w-40" />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(n => {
          const isRead = currentUser ? n.readBy.includes(currentUser.id) : false;
          return (
            <div 
              key={n.id} 
              className={cardClass(`flex gap-4 transition-all hover:border-primary/30 ${!isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900' : ''}`)}
              onClick={() => !isRead && handleMarkRead(n.id)}
            >
              <div className="shrink-0 mt-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!isRead ? 'bg-white dark:bg-card shadow-sm' : 'bg-soft-bg dark:bg-slate-800'}`}>
                  {getIcon(n.category)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className={`text-base ${!isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">{n.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(n.date)}</span>
                </div>
                {n.attachment && (
                  <div className="mt-3">
                    <span className="inline-flex items-center text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-800">
                      📎 {n.attachment}
                    </span>
                  </div>
                )}
              </div>
              <div className="shrink-0 flex items-center">
                {!isRead && (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No notifications found.
          </div>
        )}
      </div>
    </div>
  );
}
