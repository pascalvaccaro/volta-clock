import type Bree from 'bree';
import { ipcMain } from 'electron';
import { Subject } from 'rxjs';
import { exposeIpcMainRxStorage } from 'rxdb/plugins/electron';
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';
// @ts-ignore
import LokiFSAdapter from 'lokijs/src/loki-fs-sync-adapter';
import {
  exposeRxStorageRemote,
  MessageToRemote,
  RxStorageRemoteExposeSettings,
} from 'rxdb/plugins/storage-remote';
import { CHANNEL_KEY, STORAGE_KEY } from '../shared/constants';

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
  const channelId = [CHANNEL_KEY, key].join('|');
  ipcStorage.on(channelId, (message) => {
    if (message) messages$.next(message);
  });
  const send: RxStorageRemoteExposeSettings['send'] = (msg) => {
    ipcStorage.workers.forEach((worker) => {
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

export default storage;
