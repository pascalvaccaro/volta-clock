import dayjs from 'dayjs';
import {
  deleteAlarm,
  fetchAlarms,
  listAlarms,
  mutateAlarm,
  ringAlarm,
  addRing,
  stopRing,
} from './reducers';
import type { AlarmDocType } from '../../shared/typings';
import { startListening } from './listener';

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
