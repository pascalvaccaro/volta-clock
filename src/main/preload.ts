// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { AlarmDocType, Channels, IPCMetadata } from '../shared/typings';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(
      channel: Channels,
      func: (body: AlarmDocType, metadata: IPCMetadata) => void,
    ) {
      const subscription = (
        _event: IpcRendererEvent,
        ...args: [AlarmDocType, IPCMetadata]
      ) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
