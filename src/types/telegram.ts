export interface TelegramConfig {
  botToken: string;
  chatIds: {
    cron: string;        // Chat ID for cron notifications
    admin: string;       // Chat ID for admin notifications
    alerts: string;      // Chat ID for alerts/errors
    reports?: string;    // Optional: for reports
  };
}

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disableNotification?: boolean;
  replyMarkup?: TelegramReplyMarkup;
}

export interface TelegramReplyMarkup {
  inline_keyboard?: InlineKeyboardButton[][];
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface TelegramResponse {
  ok: boolean;
  result?: any;
  error_code?: number;
  description?: string;
}

export interface CronReport {
  jobName: string;
  status: 'success' | 'failed' | 'partial';
  result: Record<string, any>;
  errors: string[];
  duration: number; // ms
  timestamp: string;
}

export interface AlertPayload {
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;       // e.g., 'api/orders', 'page/checkout'
  metadata?: Record<string, any>;
  error?: Error;
}