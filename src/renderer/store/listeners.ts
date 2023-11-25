import dayjs from 'dayjs';
import { map } from 'rxjs';
import { RxStorageLokiStatics } from 'rxdb/plugins/storage-lokijs';
import { getRxStorageIpcRenderer } from 'rxdb/plugins/electron';
import type { MatchFunction } from '@reduxjs/toolkit/dist/listenerMiddleware/types';
import type { AppDispatch, StartAppListening } from '.';
import {
  listener,
  deleteAlarm,
  fetchAlarms,
  listAlarms,
  mutateAlarm,
  listener,
} from './reducers';
import type { AlarmDocType } from '../../shared/typings';
import { STORAGE_KEY } from '../../shared/constants';
import { startRxDatabase } from '../../shared/database';

const wrapper = listener.startListening as StartAppListening;
const storage = getRxStorageIpcRenderer({
  key: STORAGE_KEY,
  mode: 'storage',
  statics: RxStorageLokiStatics,
  ipcRenderer: window.electron.ipcStorage,
});
// @ts-ignore
const startListening: StartAppListening = (opts) => {
  const effect: Parameters<StartAppListening>[0]['effect'] = async (_, api) => {
    if (typeof api.extra.alarms === 'undefined')
      api.extra = await startRxDatabase(storage).then((db) => db.collections);
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

startListening({
  actionCreator: fetchAlarms,
  effect: (_, api) => {
    api.extra.alarms
      .find({ sort: [{ datetime: 'desc' }] })
      .$.pipe(map((res) => res.map((item) => item.toJSON())))
      .subscribe((payload) => api.dispatch(listAlarms(payload)));
  },
});

startListening({
  actionCreator: mutateAlarm,
  effect: async (action, api) => {
    // when changing the time of an alarm
    if (action.payload.datetime !== action.payload.alarm.datetime) {
      const query = api.extra.alarms.findOne(action.payload.datetime);
      const alarm = await query.exec();
      if (alarm) {
        action.payload.alarm = {
          ...alarm.toJSON(),
          ...action.payload.alarm,
        };
        await query.remove();
      }
    }
    const datetime = api.extra.alarms.statics.getExactTime(
      action.payload.alarm.datetime,
    );
    const alarm = await api.extra.alarms
      .upsert({
        ...action.payload.alarm,
        datetime,
      })
      .then((doc) => doc.toJSON());

    // api.dispatch(...alarm);
  },
});

startListening({
  actionCreator: deleteAlarm,
  effect: async (action, api) => {
    await api.extra.alarms.findOne(action.payload.datetime).remove();
  },
});

});
