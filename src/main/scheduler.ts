import Bree from 'bree';
import path from 'node:path';
import process from 'node:process';
import BreeTsWorker from '@breejs/ts-worker';

Bree.extend(BreeTsWorker);
const bree = new Bree({
  root: path.resolve(__dirname, 'jobs'),
  defaultExtension: process.env.NODE_ENV === 'development' ? 'ts' : 'js',
  jobs: [{ name: 'check-alarms', cron: '* * * * *' }],
});

export default bree;
