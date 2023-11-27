import { RxStorageLokiStatics } from 'rxdb/plugins/storage-lokijs';
import { getRxStorageIpcRenderer } from 'rxdb/plugins/electron';
import {
  createListenerMiddleware,
  TypedStartListening,
} from '@reduxjs/toolkit';
import type { MatchFunction } from '@reduxjs/toolkit/dist/listenerMiddleware/types';
import type { RootState, AppDispatch } from '.';
import type { ClockCollections } from '../../shared/typings';
import { STORAGE_KEY } from '../../shared/constants';
import db, { startRxDatabase } from '../../shared/database';

const getStorage = (key = STORAGE_KEY) =>
  getRxStorageIpcRenderer({
    key,
    mode: 'storage',
    statics: RxStorageLokiStatics,
    ipcRenderer: window.electron.ipcStorage,
  });

const listener = createListenerMiddleware({
  extra: db.collections,
});
type StartAppListening = TypedStartListening<
  RootState,
  AppDispatch,
  ClockCollections
>;
const wrapper = listener.startListening as StartAppListening;
// @ts-expect-error
export const startListening: StartAppListening = (opts) => {
  const effect: Parameters<StartAppListening>[0]['effect'] = async (_, api) => {
    /** @todo find another way to inject collections into api */
    if (typeof api.extra === 'undefined')
      api.extra = await startRxDatabase(getStorage()).then(
        (db) => db.collections,
      );
    return opts.effect(_, api);
  };
  if (opts.type) return wrapper({ type: opts.type, effect });
  if (opts.actionCreator)
    return wrapper({ actionCreator: opts.actionCreator, effect });
  if (opts.matcher)
    return wrapper({
      matcher: opts.matcher as MatchFunction<Parameters<AppDispatch>[0]>,
      effect,
    });
  return wrapper({ predicate: opts.predicate, effect });
};

export default listener;
