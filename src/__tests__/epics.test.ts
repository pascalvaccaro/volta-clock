import type { RxStorageRemote } from 'rxdb/plugins/storage-remote';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { waitFor } from '@testing-library/dom';
import { startRxDatabase } from '../shared/database';
import type { ClockDatabase } from '../shared/typings';
import { getStore } from '../renderer/store';
import { fetchAlarms, mutateAlarm } from '../renderer/store/reducers';

describe('Epics', () => {
  let store: ReturnType<typeof getStore>;
  let db: ClockDatabase;
  let dispatch: jest.SpyInstance;

  beforeAll(async () => {
    const storage = getRxStorageMemory() as unknown as RxStorageRemote;
    db = await startRxDatabase(storage);
  });

  beforeEach(() => {
    store = getStore();
    store.dispatch(fetchAlarms());
    dispatch = jest.spyOn(store, 'dispatch');
  });

  afterEach(async () => {
    await db.alarms
      .find()
      .exec()
      .then((docs) => Promise.all(docs.map((doc) => doc.remove())));
  });

  it('should add 1 alarm to the alarms list', async () => {
    const body = {
      datetime: new Date().toISOString(),
      name: 'alarm1',
      active: true,
    };
    store.dispatch(mutateAlarm({ body }));
    await waitFor(
      () =>
        new Promise<number>((resolve) => {
          setTimeout(resolve, 150);
        }),
    );
    const { alarms } = store.getState();
    expect(alarms.length).toBe(1);
    expect(alarms[0]).toHaveProperty('id');
  });
});
