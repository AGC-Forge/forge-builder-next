import { telegram } from './client';
import {
  formatCronReport,
  formatAlert,
  formatNewRegistration,
  formatNewOrder,
  formatErrorReport
} from './messages';
import type { CronReport, AlertPayload } from '@/types/telegram';

// ── Cron Job Notifications ──────────────────────────────────────────
export async function notifyCronJob(report: CronReport) {
  const message = formatCronReport(report);
  return telegram.sendToCron(message);
}

// ── Alert Notifications ─────────────────────────────────────────────
export async function notifyAlert(payload: AlertPayload) {
  const message = formatAlert(payload);

  // Critical & Error → send to alerts chat
  if (payload.level === 'critical' || payload.level === 'error') {
    return telegram.sendAlert(message);
  }

  // Warning & Info → send to admin chat
  return telegram.sendToAdmin(message, { disableNotification: true });
}

// ── Business Notifications ──────────────────────────────────────────
export async function notifyNewRegistration(data: {
  email: string;
  name: string;
  plan?: string;
}) {
  const message = formatNewRegistration({
    ...data,
    timestamp: new Date().toISOString(),
  });
  return telegram.sendToAdmin(message);
}

export async function notifyNewOrder(data: {
  orderId: string;
  customer: string;
  amount: number;
  currency?: string;
  products: number;
}) {
  const message = formatNewOrder(data);
  return telegram.sendToAdmin(message, { disableNotification: false });
}

export async function notifyError(data: {
  error: Error;
  route: string;
  userId?: string;
}) {
  const message = formatErrorReport(data);
  return telegram.sendAlert(message);
}

// ── Generic Notification ────────────────────────────────────────────
export async function sendToChannel(
  channel: 'cron' | 'admin' | 'alerts',
  message: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
) {
  const chatMap = {
    cron: () => telegram.sendToCron(message, { parseMode }),
    admin: () => telegram.sendToAdmin(message, { parseMode }),
    alerts: () => telegram.sendAlert(message, { parseMode }),
  };

  return chatMap[channel]();
}