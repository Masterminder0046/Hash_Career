import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await Notification.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany(
        { userId: req.user!.userId, isRead: false },
        { isRead: true }
      );
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user!.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'warning' | 'success' | 'error' = 'info',
  category: 'profile' | 'resume' | 'company' | 'roadmap' | 'interview' | 'general' = 'general',
  link?: string
) => {
  try {
    await Notification.create({ userId, title, message, type, category, link });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
