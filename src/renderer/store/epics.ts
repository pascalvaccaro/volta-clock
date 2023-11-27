import dayjs from 'dayjs';
import { startListening } from './listener';
import {
  deleteAlarm,
  fetchAlarms,
  listAlarms,
  mutateAlarm,
  scheduleAlarm,
  isCancelled,
  setRing,
} from './reducers';

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
  effect: async ({ payload }, api) => {
    const body = await api.extra.alarms.statics.getSafeAlarmUpsertBody(payload);
    const alarm = await api.extra.alarms.upsert(body);
    if (alarm.isJustBeforeNow()) api.dispatch(scheduleAlarm(alarm.toJSON()));
  },
});

startListening({
  actionCreator: deleteAlarm,
  effect: async (action, api) => {
    await api.extra.alarms.findOne(action.payload).remove();
  },
});

startListening({
  actionCreator: scheduleAlarm,
  effect: async ({ payload: alarm }, api) => {
    const timeout = dayjs(alarm.datetime).diff();
    if (timeout > 6e4 || timeout <= 0) return;
    // In case the alarm is edited/deleted before the next minute
    if (await api.condition(isCancelled(alarm), timeout)) return;
    api.dispatch(setRing(alarm));
  },
});
