export const NOTIFICATION_TYPES = {
  FOLLOW_USER: 'follow_user',
  LIKE_POST: 'like_post',
  LIKE_COMMENT: 'like_comment',
  LIKE_REPLY: 'like_reply',
  COMMENT_POST: 'comment_post',
  REPLY_COMMENT: 'reply_comment',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_MESSAGES = {
  [NOTIFICATION_TYPES.FOLLOW_USER]: (name: string) => `${name} started following you`,
  [NOTIFICATION_TYPES.LIKE_POST]: (name: string) => `${name} liked your post`,
  [NOTIFICATION_TYPES.LIKE_COMMENT]: (name: string) => `${name} liked your comment`,
  [NOTIFICATION_TYPES.LIKE_REPLY]: (name: string) => `${name} liked your reply`,
  [NOTIFICATION_TYPES.COMMENT_POST]: (name: string) => `${name} commented on your post`,
  [NOTIFICATION_TYPES.REPLY_COMMENT]: (name: string) => `${name} replied to your comment`,
} as const;

export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.FOLLOW_USER]: '👥',
  [NOTIFICATION_TYPES.LIKE_POST]: '❤️',
  [NOTIFICATION_TYPES.LIKE_COMMENT]: '💬',
  [NOTIFICATION_TYPES.LIKE_REPLY]: '💬',
  [NOTIFICATION_TYPES.COMMENT_POST]: '💭',
  [NOTIFICATION_TYPES.REPLY_COMMENT]: '↩️',
} as const;

export const NOTIFICATION_CONFIG = {
  RECENT_NOTIFICATIONS_LIMIT: 6,
  NOTIFICATIONS_PER_PAGE: 20,
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
} as const; 