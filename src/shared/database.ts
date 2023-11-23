import dayjs from 'dayjs';
import { noop } from 'rxjs';
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import type { RxStorageRemote } from 'rxdb/plugins/storage-remote';
import type { AlarmDocType, ClockDatabase } from './typings';
import alarmSchema from './schemas/alarm';

// @ts-expect-error
// eslint-disable-next-line import/no-mutable-exports, no-undef-init
let db: ClockDatabase = undefined;

export const getExactTime = (datetime: string) =>
  dayjs(datetime).set('second', 0).set('milliseconds', 0).toISOString();

export const getSoonestFrom = (
  { base, unit }: { base: dayjs.Dayjs; unit: 'minute' | 'second' } = {
    base: dayjs(),
    unit: 'minute',
  },
) => {
  const datetime = base.add(1, unit).set('milliseconds', 0);
  return (
    unit === 'minute' ? datetime.set('second', 0) : datetime
  ).toISOString();
};

export async function startRxDatabase(storage: RxStorageRemote) {
  let name = `volta-clock-db`;
  if (typeof db === 'undefined') {
    addRxPlugin(RxDBJsonDumpPlugin);
    addRxPlugin(RxDBQueryBuilderPlugin);
    if (process.env.NODE_ENV !== 'production') {
      name = `.erb/dll/${name}`;
      await import('rxdb/plugins/dev-mode')
        .then((mod) => addRxPlugin(mod.RxDBDevModePlugin))
        .catch(noop);
    }
    db = await createRxDatabase({
      name,
      storage,
      multiInstance: true,
      eventReduce: true,
    });
    if (!db.collections.alarms) {
      await db.addCollections({
        alarms: {
          schema: alarmSchema,
          statics: { getSoonestFrom, getExactTime },
        },
      });
    }
  }

  return db as ClockDatabase;
}

export default db;
