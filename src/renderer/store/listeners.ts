import { RxStorageDefaultStatics } from 'rxdb';
import { getRxStorageIpcRenderer } from 'rxdb/plugins/electron';
import { map } from 'rxjs';
import type { StartAppListening } from '.';
import {
  deleteAlarm,
  detailAlarm,
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
  statics: RxStorageDefaultStatics,
  ipcRenderer: window.electron.ipcStorage,
});

const withStorage =
  (effect: Parameters<typeof startListening>[0]['effect']): typeof effect =>
  async (_, api) => {
    if (typeof api.extra.alarms === 'undefined')
      api.extra = await startRxDatabase(storage).then((db) => db.collections);
    return effect(_, api);
  };

startListening({
  actionCreator: fetchAlarms,
  effect: withStorage(async (_, api) => {
    api.extra.alarms
      .find()
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
    const doc = await api.extra.alarms.upsert({
      ...action.payload.alarm,
      datetime,
    });
    api.dispatch(detailAlarm(doc.toJSON()));
  }),
});

startListening({
  actionCreator: deleteAlarm,
  effect: withStorage(async (action, api) => {
    await api.extra.alarms.findOne(action.payload.datetime).remove();
  }),
});
