import { RxStorageLokiStatics } from 'rxdb/plugins/storage-lokijs';
import { getRxStorageIpcRenderer } from 'rxdb/plugins/electron';
import { map } from 'rxjs';
import type { StartAppListening } from '.';
import {
  deleteAlarm,
  fetchAlarms,
  listAlarms,
  mutateAlarm,
  listener,
} from './reducers';
import { STORAGE_KEY } from '../../shared/constants';
import { startRxDatabase } from '../../shared/database';

const startListening = listener.startListening as StartAppListening;

const storage = getRxStorageIpcRenderer({
  key: STORAGE_KEY,
  mode: 'storage',
  statics: RxStorageLokiStatics,
  ipcRenderer: window.electron.ipcStorage,
});

const withStorage =
  (effect: Parameters<typeof startListening>[0]['effect']): typeof effect =>
  async (_, api) => {
    if (typeof api.extra.alarms === 'undefined')
      api.extra = await startRxDatabase(storage).then((db) => db);
    return effect(_, api);
  };

startListening({
  actionCreator: fetchAlarms,
  effect: withStorage((_, api) => {
    api.extra.alarms
      .find({ sort: [{ datetime: 'desc' }] })
      .$.pipe(map((res) => res.map((item) => item.toJSON())))
      .subscribe((payload) => api.dispatch(listAlarms(payload)));
  }),
});

startListening({
  actionCreator: mutateAlarm,
  effect: withStorage(async (action, api) => {
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
    await api.extra.alarms.upsert({
      ...action.payload.alarm,
      datetime,
    });
  }),
});

startListening({
  actionCreator: deleteAlarm,
  effect: withStorage(async (action, api) => {
    await api.extra.alarms.findOne(action.payload.datetime).remove();
  }),
});
