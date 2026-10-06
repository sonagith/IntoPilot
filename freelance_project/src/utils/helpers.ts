// src/utils/helpers.ts

export const TODAY = new Date();

export function fmtINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function fmtDate(s: string): string {
  if (!s || s === '—') return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function totalPaid(c: any): number {
  return c.payments ? c.payments.reduce((s: number, p: any) => s + p.amount, 0) : 0;
}

export function balanceOf(c: any): number {
  if (!c || !c.plot) return 0;
  return Math.max(0, c.plot.totalValue - totalPaid(c));
}

export function overdueDays(c: any): number | null {
  if (balanceOf(c) <= 0 || !c.dueDate) return null;
  return Math.floor((TODAY.getTime() - new Date(c.dueDate).getTime()) / (1000 * 60 * 60 * 24));
}

export function stageOf(c: any) {
  if (balanceOf(c) <= 0) return { key: 'paid', label: 'Fully Paid', color: 'green' };
  const d = overdueDays(c);
  if (d === null || d < 0) return { key: 'ontrack', label: 'On Track', color: 'blue' };
  if (d <= 10) return { key: 'grace', label: 'Grace Period', color: 'blue' };
  if (d <= 12) return { key: 'sms', label: 'Day 11 · SMS Sent', color: 'orange' };
  if (d <= 14) return { key: 'wa', label: 'Day 13 · WhatsApp Sent', color: 'orange' };
  if (d === 15) return { key: 'voice', label: 'Day 15 · Voice Call', color: 'red' };
  return { key: 'escalated', label: 'Day 16+ · Escalated', color: 'red' };
}

export function statusBadge(status: string): string {
  const map: Record<string, [string, string]> = {
    open: ['Open', 'blue'],
    in_progress: ['In Progress', 'orange'],
    resolved: ['Resolved', 'green']
  };
  const pair = map[status] || ['—', 'gray'];
  return `<span class="badge b-${pair[1]}">${pair[0]}</span>`;
}

export function badge(text: string, color: string): string {
  return `<span class="badge b-${color}">${text}</span>`;
}

export function paginate<T>(arr: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(arr.length / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  return {
    rows: arr.slice((currentPage - 1) * perPage, currentPage * perPage),
    page: currentPage,
    totalPages,
    total: arr.length
  };
}

export function projectStats(cases: any[], projectId: string) {
  const list = cases.filter(c => c.projectId === projectId);
  const totalValue = list.reduce((s, c) => s + (c.plot?.totalValue || 0), 0);
  const collected = list.reduce((s, c) => s + totalPaid(c), 0);
  return {
    count: list.length,
    totalValue,
    collected,
    pending: totalValue - collected,
    rate: totalValue ? Math.round((collected / totalValue) * 100) : 0
  };
}