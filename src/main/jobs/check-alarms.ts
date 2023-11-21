import { parentPort } from 'node:worker_threads';
import process from 'node:process';

if (parentPort) {
  const now = new Date();
  parentPort.postMessage({
    channel: 'alarm-ring',
    body: {
      seconds: now.getSeconds(),
      millis: now.getMilliseconds(),
    },
  });
}
process.exit(0);
