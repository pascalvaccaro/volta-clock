import { parentPort } from 'node:worker_threads';
import process from 'node:process';

if (parentPort) parentPort.postMessage('done');
process.exit(0);
