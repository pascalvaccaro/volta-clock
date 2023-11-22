import dayjs from 'dayjs';
import {
  type RxCollection,
  type RxDatabase,
  addRxPlugin,
  createRxDatabase,
  removeRxDatabase,
} from 'rxdb';
import type { RxStorageRemote } from 'rxdb/plugins/storage-remote';
import alarmSchema, { AlarmDocType } from './schemas/alarm';

export type ClockCollections = {
  alarms: RxCollection<AlarmDocType>;
};

let db: RxDatabase<ClockCollections>;

export const getAlarms = async () => {
  const alarms = await db.collections.alarms.find().exec();
  return alarms.map((alarm) => alarm.toJSON());
};

export const getAlarm = async (datetime: string) => {
  const alarm = await db.collections.alarms
    .findOne({ selector: { datetime } })
    .exec();
  if (!alarm) {
    throw Error(`No alarm found with datetime ${datetime}`);
  }
  return alarm.toJSON();
};

export const setAlarm = async (alarm: Partial<AlarmDocType>) => {
  const datetime = dayjs(alarm.datetime)
    .set('second', 0)
    .set('milliseconds', 0)
    .toISOString();
  const doc = await db.collections.alarms.upsert({ ...alarm, datetime });
  return doc.toJSON();
};

export const unsetAlarm = async (alarm: AlarmDocType) => {
  const query = db.collections.alarms.findOne(alarm.datetime);
  await query.remove();
};

export const getSoonestFrom = (
  { base, unit }: { base: dayjs.Dayjs; unit: 'minute' | 'second' } = {
    base: dayjs(),
    unit: 'minute',
  },
) => {
  const datetime = base.add(1, unit).set('milliseconds', 0);
  return unit === 'minute'
    ? datetime.set('second', 0).toISOString()
    : datetime.toISOString();
};

export async function startRxDatabase(storage: RxStorageRemote) {
  const name = 'volta-clock-db';
  if (typeof db === 'undefined') {
    if (process.env.NODE_ENV !== 'production') {
      await import('rxdb/plugins/dev-mode').then((mod) =>
        addRxPlugin(mod.RxDBDevModePlugin),
      );
      await removeRxDatabase(name, storage);
    }
    db = await createRxDatabase({
      name,
      storage,
    });
    if (!db.collections.alarms) {
      await db.addCollections({
        alarms: {
          schema: alarmSchema,
          statics: { getSoonestFrom },
        },
      });
    }
  }

  return db;
}
