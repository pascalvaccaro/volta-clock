import type { MessagePort } from 'node:worker_threads';
import { ipcMain } from 'electron';
// @ts-ignore
import LokiFSAdapter from 'lokijs/src/loki-fs-sync-adapter';
import type Bree from 'bree';
import { exposeIpcMainRxStorage } from 'rxdb/plugins/electron';
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';
import {
  type MessageFromRemote,
  getRxStorageRemote,
  exposeRxStorageRemote,
  MessageToRemote,
  RxStorageRemoteExposeSettings,
} from 'rxdb/plugins/storage-remote';
import { Subject } from 'rxjs';

let storage: ReturnType<typeof getRxStorageLoki>;

export const STORAGE_KEY = 'main-storage';
export const CHANNEL_KEY = 'rxdb-ipc-worker-storage';

export async function getRxWorkerStorage(
  parent: MessagePort,
  key = STORAGE_KEY,
) {
  const channelId = [CHANNEL_KEY, key].join('|');
  return getRxStorageRemote({
    identifier: 'check-alarms',
    statics: getRxStorageLoki().statics,
    async messageChannelCreator() {
      const messages$ = new Subject<MessageFromRemote>();
      const listener = (msg: any) => {
        if (msg.channel === channelId.replace('-', '_'))
          messages$.next(msg.body);
      };
      parent.on('message', listener);
      return {
        messages$,
        send(msg) {
          parent.postMessage({ channel: channelId, body: msg });
        },
        async close() {
          parent.off('message', listener);
          return Promise.resolve(undefined);
        },
      };
    },
  });
}

export async function startRxStorage(key = STORAGE_KEY) {
  if (typeof storage === 'undefined') {
    storage = getRxStorageLoki({
      adapter: new LokiFSAdapter(),
    });

    exposeIpcMainRxStorage({
      key,
      storage,
      ipcMain,
    });
  }
  return storage;
}

export function exposeIpcWorkerRxStorage({
  key = STORAGE_KEY,
  storage,
  pool,
}: {
  key?: string;
  storage: Awaited<ReturnType<typeof startRxStorage>>;
  pool: Bree;
}) {
  const messages$ = new Subject<MessageToRemote>();
  const channelId = [CHANNEL_KEY, key].join('|');
  pool.on(channelId, (message) => {
    if (message) messages$.next(message);
  });
  const send: RxStorageRemoteExposeSettings['send'] = (msg) => {
    pool.workers.forEach((worker) => {
      worker.postMessage({ channel: channelId.replace('-', '_'), body: msg });
    });
  };
  exposeRxStorageRemote({
    messages$,
    storage,
    send,
  });

  return { messages$, channelId } as const;
}
