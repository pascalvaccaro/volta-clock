import type Bree from 'bree';
import { ipcMain } from 'electron';
import { Subject } from 'rxjs';
import { exposeIpcMainRxStorage } from 'rxdb/plugins/electron';
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';
// @ts-expect-error
import LokiFSAdapter from 'lokijs/src/loki-fs-sync-adapter';
import {
  exposeRxStorageRemote,
  MessageToRemote,
  RxStorageRemoteExposeSettings,
} from 'rxdb/plugins/storage-remote';
import {
  RX_WORKER_CHANNEL,
  STORAGE_KEY,
  TX_WORKER_CHANNEL,
} from '../shared/constants';
import { getFullChannel } from './util';

const storage = getRxStorageLoki({
  adapter: new LokiFSAdapter(),
});

exposeIpcMainRxStorage({
  key: STORAGE_KEY,
  storage,
  ipcMain,
});

export function exposeIpcWorkerRxStorage({
  key = STORAGE_KEY,
  ipcStorage,
}: {
  key?: string;
  ipcStorage: Bree;
}) {
  const messages$ = new Subject<MessageToRemote>();
  const [channelId, channel] = [RX_WORKER_CHANNEL, TX_WORKER_CHANNEL].map(
    getFullChannel(key),
  );
  ipcStorage.on(channelId, (message) => {
    if (message) messages$.next(message);
  });
  const send: RxStorageRemoteExposeSettings['send'] = (body) => {
    ipcStorage.workers.forEach((worker) => {
      worker.postMessage({ channel, body });
    });
  };
  exposeRxStorageRemote({
    messages$,
    storage,
    send,
  });

  return { messages$, channelId } as const;
}

export default storage;
