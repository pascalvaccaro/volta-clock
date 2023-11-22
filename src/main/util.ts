/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import dayjs from 'dayjs';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const getSafeTimeoutFrom = (now = dayjs()) =>
  now.get('seconds') >= 55 ? 5 : 0;
