import Bree, { type PluginFunc } from 'bree';
import path from 'node:path';
import process from 'node:process';
import withTypescript from '@breejs/ts-worker';
import type { WebContents } from 'electron';
import type { MessageToRemote } from 'rxdb/plugins/storage-remote';
import { startRxStorage, exposeIpcWorkerRxStorage } from './storage';
import { getSafeTimeoutFrom } from './util';
import type { WorkerEvent } from '../shared/typings';

const withElectron: PluginFunc = (_, Bree) => {
  const protoStart = Bree.prototype.start;

  Bree.prototype.start = async function start(name, webContents?: WebContents) {
    if (!webContents) return protoStart.call(this, name);
    const storage = await startRxStorage();
    const { messages$, channelId } = exposeIpcWorkerRxStorage({
      storage,
      pool: this,
    });

    this.config.workerMessageHandler = (ev: WorkerEvent) => {
      if (ev.name === name) {
        const { channel, body, metadata = {} } = ev.message;
        if (channel === 'error') console.error(body, metadata);
        else if (channel === channelId) {
          messages$.next(body as MessageToRemote);
        } else webContents.send(channel, body, metadata);
      }
    };
    return protoStart.call(this, name);
  };
};
Bree.extend(withTypescript);
Bree.extend(withElectron);

const bree = new Bree({
  root: path.resolve(__dirname, 'jobs'),
  defaultExtension: process.env.NODE_ENV === 'development' ? 'ts' : 'js',
  jobs: [
    { name: 'check-alarms', cron: '* * * * *', timeout: getSafeTimeoutFrom() },
  ],
});

export default bree;
