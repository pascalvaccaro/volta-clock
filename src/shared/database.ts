import dayjs from 'dayjs';
import { noop } from 'rxjs';
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import type { RxStorageRemote } from 'rxdb/plugins/storage-remote';
import type { ClockDatabase } from './typings';
import alarmSchema, { type AlarmDocType } from './schemas/alarm';

// eslint-disable-next-line import/no-mutable-exports, no-undef-init
let db = {} as ClockDatabase;

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

export function isJustBeforeNow(this: AlarmDocType) {
  return this.active && this.datetime === getSoonestFrom();
}

export const getSafeAlarmUpsertBody = async (payload: {
  id: string;
  body: AlarmDocType;
}) => {
  let {
    // eslint-disable-next-line prefer-const
    body: { id: bodyId, ...body },
  } = payload;
  if (payload.id && payload.id !== [body.datetime, body.name].join('_')) {
    const query = db.collections.alarms.findOne(payload.id);
    const doc = await query.remove();
    if (doc) {
      const { id, ...rest } = doc.toJSON();
      body = {
        ...rest,
        ...body,
      };
    }
  }
  return {
    ...body,
    datetime: getExactTime(body.datetime),
  };
};

export async function startRxDatabase(storage: RxStorageRemote) {
  let name = `volta-clock-db`;
  if (!db.collections) {
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
          statics: { getSoonestFrom, getExactTime, getSafeAlarmUpsertBody },
          methods: { isJustBeforeNow },
        },
      });
    }
  }

  return db;
}

export default db;
