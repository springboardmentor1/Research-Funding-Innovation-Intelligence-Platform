import api from './api';
import dashboardService from './dashboardService';

export const notificationService = {
  // Get notifications combining AI insights and recent activities
  getNotifications: async () => {
    try {
      const dashboardData = await dashboardService.getDashboard();
      
      // Transform insights into notification format
      const insightNotifications = (dashboardData.insights || []).map((insight, index) => ({
        id: `insight-${index}`,
        type: 'insight',
        title: 'AI Insight',
        message: insight,
        time: 'Just now',
        read: false,
        icon: 'lightbulb'
      }));

      // Transform activities into notification format
      const activityNotifications = (dashboardData.activities || []).map((activity, index) => ({
        id: `activity-${index}`,
        type: 'activity',
        title: 'Recent Activity',
        message: activity.title,
        time: activity.time,
        read: false,
        icon: 'timeline'
      }));

      // Combine and sort by most recent
      const allNotifications = [...insightNotifications, ...activityNotifications];
      
      return {
        notifications: allNotifications,
        unreadCount: allNotifications.filter(n => !n.read).length
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return default notifications on error
      return {
        notifications: [
          {
            id: 'default-1',
            type: 'insight',
            title: 'AI Insight',
            message: 'Complete your research profile to get personalized insights',
            time: 'Just now',
            read: false,
            icon: 'lightbulb'
          },
          {
            id: 'default-2',
            type: 'activity',
            title: 'Recent Activity',
            message: 'Welcome to the platform',
            time: 'Just now',
            read: false,
            icon: 'timeline'
          }
        ],
        unreadCount: 2
      };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    // This would call a backend endpoint in production
    // For now, we'll handle it in the frontend state
    return { success: true };
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    // This would call a backend endpoint in production
    // For now, we'll handle it in the frontend state
    return { success: true };
  }
};

export default notificationService;
