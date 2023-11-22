import type { MessageToRemote } from 'rxdb/plugins/storage-remote';
import type { AlarmDocType } from './schemas/alarm';

export type Channels = 'ipc-example' | 'alarm-ring' | 'error';
export type IPCMetadata = {
  seconds: number;
  millis: number;
};
export type IPCMessage<DocType = AlarmDocType> = {
  channel: Channels;
  body: DocType;
  metadata: IPCMetadata;
};
export { AlarmDocType };

export type WorkerEvent<T = AlarmDocType | MessageToRemote> = {
  name: string;
  message: IPCMessage<T>;
};
