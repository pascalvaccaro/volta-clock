import type { RxStorageRemote } from 'rxdb/plugins/storage-remote';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import store from '../renderer/store';
import { startRxDatabase } from '../shared/database';

describe('Epics', () => {
  let db;
  beforeAll(async () => {
    const storage = getRxStorageMemory() as unknown as RxStorageRemote;
    db = await startRxDatabase(storage);
  });

  describe('Alarms', () => {
    it('should be true', () => {
      expect(store.getState()).toBeDefined();
    });
  });
});
