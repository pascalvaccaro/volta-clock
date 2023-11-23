import process from 'node:process';
import { parentPort } from 'node:worker_threads';
import { getRxWorkerStorage } from '../worker';
import { startRxDatabase } from '../../shared/database';
import type { AlarmDocType, IPCMessage } from '../../shared/typings';

(async (port) => {
  const now = new Date();
  if (port) {
    try {
      const storage = getRxWorkerStorage(port);
      const db = await startRxDatabase(storage);
      const datetime = db.collections.alarms.statics.getSoonestFrom();
      const body = await db.collections.alarms
        .findOne({ selector: { datetime, active: true } })
        .exec()
        .then((res) => res?.toJSON());
      if (body) {
        const message: IPCMessage<AlarmDocType> = {
          channel: 'alarm-ring',
          body,
          metadata: {
            seconds: now.getSeconds(),
            millis: now.getMilliseconds(),
          },
        };
        port.postMessage(message);
      }
    } catch (err) {
      port.postMessage({ channel: 'error', body: err });
    }
  }

  process.exit(0);
})(parentPort);
