import type { MessagePort } from 'node:worker_threads';
import { Subject } from 'rxjs';
import {
  getRxStorageRemote,
  type MessageFromRemote,
} from 'rxdb/plugins/storage-remote';
import { RxStorageLokiStatics } from 'rxdb/plugins/storage-lokijs';
import {
  STORAGE_KEY,
  RX_WORKER_CHANNEL,
  TX_WORKER_CHANNEL,
} from '../shared/constants';
import { getFullChannel } from './util';

// eslint-disable-next-line import/prefer-default-export
export function getRxWorkerStorage(parent: MessagePort, key = STORAGE_KEY) {
  const [channel, channelId] = [RX_WORKER_CHANNEL, TX_WORKER_CHANNEL].map(
    getFullChannel(key),
  );
  return getRxStorageRemote({
    identifier: 'check-alarms',
    statics: RxStorageLokiStatics,
    async messageChannelCreator() {
      const messages$ = new Subject<MessageFromRemote>();
      const listener = (msg: any) => {
        if (msg.channel === channelId) messages$.next(msg.body);
      };
      parent.on('message', listener);
      return {
        messages$,
        send(body) {
          parent.postMessage({ channel, body });
        },
        async close() {
          parent.off('message', listener);
          return Promise.resolve(undefined);
        },
      };
    },
  });
}
