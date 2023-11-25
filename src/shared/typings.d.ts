import type { RxCollection, RxDatabase, RxDocument } from 'rxdb';
import type { MessageToRemote } from 'rxdb/plugins/storage-remote';
import type { AlarmDocType } from './schemas/alarm';

export type AlarmDocMethods = {
  isEqual: (alarm: AlarmDocType) => boolean;
  isJustBeforeNow: () => boolean;
};
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
export type AlarmDocument = RxDocument<AlarmDocType, AlarmDocMethods>;
export type WorkerEvent<T = AlarmDocType | MessageToRemote> = {
  name: string;
  message: IPCMessage<T>;
};

export type ClockCollections = {
  alarms: RxCollection<AlarmDocType, AlarmDocMethods>;
};

export type ClockDatabase = RxDatabase<ClockCollections>;
