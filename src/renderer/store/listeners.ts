import dayjs from 'dayjs';
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
  ringAlarm,
  addRing,
  stopRing,
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
// @ts-expect-error
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
      .$.subscribe((payload) => api.dispatch(listAlarms(payload)));
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
    const alarm = await api.extra.alarms.upsert({
      ...action.payload.alarm,
      datetime,
    });
    // In case the alarm is set to the next minute
    if (alarm.isJustBeforeNow()) api.dispatch(ringAlarm(alarm.toJSON()));
  },
});

startListening({
  actionCreator: deleteAlarm,
  effect: async (action, api) => {
    await api.extra.alarms.findOne(action.payload.datetime).remove();
  },
});

const isCancelled = (alarm: AlarmDocType) => (action: any) =>
  listAlarms.match(action) &&
  !action.payload.find((doc) => doc.active && doc.isEqual(alarm));

startListening({
  actionCreator: ringAlarm,
  effect: async (action, api) => {
    const alarm = action.payload;
    const timeout = dayjs(alarm.datetime).diff();
    if (timeout > 6e4 || timeout <= 0) return;
    // In case the alarm is mutated/deleted before the next minute
    if (await api.condition(isCancelled(alarm), timeout)) return;
    api.dispatch(addRing(alarm));
  },
});

startListening({
  actionCreator: stopRing,
  effect: async (action, api) => {
    await api.extra.alarms.upsert({ ...action.payload, active: false });
  },
});
