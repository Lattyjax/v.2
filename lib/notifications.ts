/**
 * Notification System for Latimore Hub
 * Real-time alerts and notifications for admins
 */

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export interface Notification {
  id: string
  type: 'lead' | 'task' | 'appointment' | 'system' | 'conversion'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
  contactId?: string
  taskId?: string
  appointmentId?: string
}

export interface NotificationPreferences {
  email: boolean
  inApp: boolean
  sms: boolean
  leadAlerts: boolean
  taskReminders: boolean
  appointmentReminders: boolean
  systemAlerts: boolean
  conversionMilestones: boolean
}

// In-memory notification store (in production, use Redis/database)
let notifications: Notification[] = []
let preferences: NotificationPreferences = {
  email: true,
  inApp: true,
  sms: false,
  leadAlerts: true,
  taskReminders: true,
  appointmentReminders: true,
  systemAlerts: true,
  conversionMilestones: true,
}

/**
 * Create a new notification
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> {
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    read: false,
    createdAt: new Date(),
  }

  notifications.unshift(newNotification) // Add to beginning for latest first

  // Keep only last 1000 notifications
  if (notifications.length > 1000) {
    notifications = notifications.slice(0, 1000)
  }

  // Log high-priority notifications
  if (notification.priority === 'high' || notification.priority === 'urgent') {
    logger.warn({ notification }, 'High-priority notification created')
  }

  // Trigger real-time updates (would integrate with WebSocket/SSE in production)
  await triggerRealTimeUpdate(newNotification)

  return newNotification
}

/**
 * Get all notifications with optional filtering
 */
export function getNotifications(options: {
  unreadOnly?: boolean
  type?: string
  priority?: string
  limit?: number
} = {}): Notification[] {
  let filtered = notifications

  if (options.unreadOnly) {
    filtered = filtered.filter(n => !n.read)
  }

  if (options.type) {
    filtered = filtered.filter(n => n.type === options.type)
  }

  if (options.priority) {
    filtered = filtered.filter(n => n.priority === options.priority)
  }

  return filtered.slice(0, options.limit || 50)
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: string): boolean {
  const notification = notifications.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
    return true
  }
  return false
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): number {
  const unreadCount = notifications.filter(n => !n.read).length
  notifications.forEach(n => n.read = true)
  return unreadCount
}

/**
 * Get notification preferences
 */
export function getNotificationPreferences(): NotificationPreferences {
  return { ...preferences }
}

/**
 * Update notification preferences
 */
export function updateNotificationPreferences(newPreferences: Partial<NotificationPreferences>): NotificationPreferences {
  preferences = { ...preferences, ...newPreferences }
  return preferences
}

/**
 * Automated notification triggers
 */

// High-lead-score alerts
export async function checkHighLeadScoreAlerts() {
  if (!preferences.leadAlerts) return

  try {
    const highScoreContacts = await prisma.contact.findMany({
      where: {
        leadScore: { gte: 80 },
        status: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
      },
      select: { id: true, firstName: true, lastName: true, leadScore: true, email: true }
    })

    for (const contact of highScoreContacts) {
      // Check if we already alerted about this contact recently
      const recentAlert = notifications.find(n =>
        n.type === 'lead' &&
        n.contactId === contact.id &&
        n.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      )

      if (!recentAlert) {
        await createNotification({
          type: 'lead',
          priority: 'high',
          title: `High-Value Lead: ${contact.firstName} ${contact.lastName}`,
          message: `${contact.firstName} has a lead score of ${contact.leadScore}/100. Immediate follow-up recommended.`,
          data: { leadScore: contact.leadScore, email: contact.email },
          contactId: contact.id,
        })
      }
    }
  } catch (error) {
    logger.error({ error }, 'Failed to check high lead score alerts')
  }
}

// Overdue task alerts
export async function checkOverdueTaskAlerts() {
  if (!preferences.taskReminders) return

  try {
    const overdueTasks = await prisma.task.findMany({
      where: {
        dueAt: { lt: new Date() },
        status: { not: 'COMPLETED' }
      },
      include: { contact: { select: { firstName: true, lastName: true } } }
    })

    for (const task of overdueTasks) {
      // Check if we already alerted about this task recently
      const recentAlert = notifications.find(n =>
        n.type === 'task' &&
        n.taskId === task.id &&
        n.createdAt > new Date(Date.now() - 60 * 60 * 1000) // Last hour
      )

      if (!recentAlert) {
        await createNotification({
          type: 'task',
          priority: 'urgent',
          title: `Overdue Task: ${task.title}`,
          message: `Task "${task.title}" for ${task.contact?.firstName} ${task.contact?.lastName} is overdue.`,
          data: { dueDate: task.dueAt, status: task.status },
          contactId: task.contactId || undefined,
          taskId: task.id,
        })
      }
    }
  } catch (error) {
    logger.error({ error }, 'Failed to check overdue task alerts')
  }
}

// Upcoming appointment alerts
export async function checkUpcomingAppointmentAlerts() {
  if (!preferences.appointmentReminders) return

  try {
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        scheduledFor: {
          gte: new Date(),
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
        },
        status: 'SCHEDULED'
      },
      include: { contact: { select: { firstName: true, lastName: true, phone: true, email: true } } }
    })

    for (const appointment of upcomingAppointments) {
      if (!appointment.scheduledFor) continue

      const hoursUntil = Math.round((appointment.scheduledFor.getTime() - Date.now()) / (1000 * 60 * 60))

      // Alert 4 hours before, 1 hour before, and 15 minutes before
      if (hoursUntil === 4 || hoursUntil === 1 || hoursUntil <= 0.25) {
        const recentAlert = notifications.find(n =>
          n.type === 'appointment' &&
          n.appointmentId === appointment.id &&
          n.createdAt > new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
        )

        if (!recentAlert) {
          await createNotification({
            type: 'appointment',
            priority: hoursUntil <= 1 ? 'high' : 'medium',
            title: `Upcoming Appointment: ${appointment.contact?.firstName} ${appointment.contact?.lastName}`,
            message: `Appointment in ${hoursUntil > 1 ? `${hoursUntil} hours` : `${Math.round(hoursUntil * 60)} minutes`} at ${appointment.scheduledFor.toLocaleTimeString()}.`,
            data: {
              startTime: appointment.scheduledFor,
              contactPhone: appointment.contact?.phone,
              contactEmail: appointment.contact?.email
            },
            contactId: appointment.contactId,
            appointmentId: appointment.id,
          })
        }
      }
    }
  } catch (error) {
    logger.error({ error }, 'Failed to check upcoming appointment alerts')
  }
}

// Conversion milestone alerts
export async function checkConversionMilestoneAlerts() {
  if (!preferences.conversionMilestones) return

  try {
    // Check for recent conversions
    const recentConversions = await prisma.contact.findMany({
      where: {
        status: 'CLOSED_WON',
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      },
      select: { id: true, firstName: true, lastName: true, leadScore: true }
    })

    for (const contact of recentConversions) {
      await createNotification({
        type: 'conversion',
        priority: 'medium',
        title: `🎉 New Conversion: ${contact.firstName} ${contact.lastName}`,
        message: `Congratulations! ${contact.firstName} ${contact.lastName} has converted with a lead score of ${contact.leadScore || 0}/100.`,
        data: { leadScore: contact.leadScore },
        contactId: contact.id,
      })
    }

    // Check for milestone achievements
    const totalConversions = await prisma.contact.count({
      where: { status: 'CLOSED_WON' }
    })

    // Alert on milestone conversions (10, 25, 50, 100, etc.)
    const milestones = [10, 25, 50, 100, 250, 500, 1000]
    const recentMilestone = milestones.find(m => totalConversions >= m &&
      totalConversions - recentConversions.length < m)

    if (recentMilestone) {
      await createNotification({
        type: 'conversion',
        priority: 'high',
        title: `🏆 Milestone Achieved: ${recentMilestone} Conversions!`,
        message: `Congratulations! You've reached ${recentMilestone} total conversions. Keep up the excellent work!`,
        data: { totalConversions: recentMilestone },
      })
    }
  } catch (error) {
    logger.error({ error }, 'Failed to check conversion milestone alerts')
  }
}

// System health alerts
export async function checkSystemHealthAlerts() {
  if (!preferences.systemAlerts) return

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`

    // Check for failed cron jobs (would need cron job monitoring in production)
    // For now, just check if there are any critical system issues
    // Note: EventType enum doesn't include ERROR, so we'll skip error counting for now
    const errorCount = 0 // Placeholder

    if (errorCount > 10) { // Arbitrary threshold
      await createNotification({
        type: 'system',
        priority: 'high',
        title: 'High Error Rate Detected',
        message: `${errorCount} errors occurred in the last hour. System health check recommended.`,
        data: { errorCount },
      })
    }
  } catch (error) {
    logger.error({ error }, 'Failed to check system health alerts')
    // Don't create notification about health check failure to avoid loops
  }
}

/**
 * Run all automated checks (called by cron job)
 */
export async function runAutomatedNotificationChecks() {
  await Promise.all([
    checkHighLeadScoreAlerts(),
    checkOverdueTaskAlerts(),
    checkUpcomingAppointmentAlerts(),
    checkConversionMilestoneAlerts(),
    checkSystemHealthAlerts(),
  ])
}

/**
 * Real-time update trigger (placeholder for WebSocket/SSE integration)
 */
async function triggerRealTimeUpdate(notification: Notification) {
  // In production, this would emit to WebSocket clients or send SSE
  logger.debug({ title: notification.title }, 'Real-time notification')
}

/**
 * Get notification statistics
 */
export function getNotificationStats() {
  const total = notifications.length
  const unread = notifications.filter(n => !n.read).length
  const byType = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const byPriority = notifications.reduce((acc, n) => {
    acc[n.priority] = (acc[n.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return { total, unread, byType, byPriority }
}