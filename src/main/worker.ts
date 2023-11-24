import type { MessagePort } from 'node:worker_threads';
import { Subject } from 'rxjs';
import {
  getRxStorageRemote,
  type MessageFromRemote,
} from 'rxdb/plugins/storage-remote';
import { RxStorageLokiStatics } from 'rxdb/plugins/storage-lokijs';
import { STORAGE_KEY, CHANNEL_KEY } from '../shared/constants';

// eslint-disable-next-line import/prefer-default-export
export function getRxWorkerStorage(parent: MessagePort, key = STORAGE_KEY) {
  const channelId = [CHANNEL_KEY, key].join('|');
  return getRxStorageRemote({
    identifier: 'check-alarms',
    statics: RxStorageLokiStatics,
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
