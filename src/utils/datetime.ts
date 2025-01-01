import dayjs from 'dayjs';

export function formatLocalTime(time: dayjs.ConfigType): string {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
}

export const sizeToString = (bytes: any) => {
  if (bytes === 0 || bytes === '0') return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};
