// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { Channels, IPCMetadata } from '../shared/typings';

const electronHandler = {
  ipcStorage: {
    on: ipcRenderer.on.bind(ipcRenderer),
    removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
    postMessage: ipcRenderer.postMessage.bind(ipcRenderer),
  },
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on<T>(channel: Channels, func: (body: T, metadata: IPCMetadata) => void) {
      const subscription = (
        _event: IpcRendererEvent,
        ...args: [T, IPCMetadata]
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
