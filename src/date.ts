const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function dateKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function weekday(d: Date): string {
  return WEEKDAYS[d.getDay()];
}

export const WEEKDAY_LABELS = WEEKDAYS;

/** 540 → "9:00" */
export function formatTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${`${m}`.padStart(2, '0')}`;
}

export function nowMinutes(d = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
}
