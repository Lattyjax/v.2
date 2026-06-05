'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react'
import { Notification, getNotifications, markAsRead, markAllAsRead, getNotificationStats } from '@/lib/notifications'

interface NotificationCenterProps {
  className?: string
}

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  const [stats, setStats] = useState({ total: 0, unread: 0, byType: {}, byPriority: {} })

  const loadNotifications = () => {
    const notifs = getNotifications({
      unreadOnly: filter === 'unread',
      priority: filter === 'urgent' ? 'urgent' : undefined,
      limit: 50
    })
    setNotifications(notifs)
    setStats(getNotificationStats())
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
    loadNotifications()
  }

  const handleMarkAllAsRead = () => {
    const count = markAllAsRead()
    loadNotifications()
    alert(`Marked ${count} notifications as read`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-500/10'
      case 'high': return 'border-orange-500 bg-orange-500/10'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead': return <Users className="w-4 h-4" />
      case 'task': return <CheckCircle className="w-4 h-4" />
      case 'appointment': return <Clock className="w-4 h-4" />
      case 'conversion': return <TrendingUp className="w-4 h-4" />
      case 'system': return <AlertTriangle className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-h-96 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex gap-2">
                {stats.unread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mt-3">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'urgent', label: 'Urgent' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 text-xs rounded ${
                    filter === key
                      ? 'bg-[#C9A25F] text-slate-900'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                    !notification.read ? 'bg-slate-800/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded border ${getPriorityColor(notification.priority)}`}>
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-white text-sm leading-tight">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="ml-2 text-blue-400 hover:text-blue-300 flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                          notification.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                          notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-700 bg-slate-800/50">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{stats.total} total notifications</span>
                <span>{stats.unread} unread</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}