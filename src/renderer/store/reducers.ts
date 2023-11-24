import type { PayloadAction, Action } from '@reduxjs/toolkit';
import { createListenerMiddleware, createSlice } from '@reduxjs/toolkit';
import type { AlarmDocType } from '../../shared/typings';

const alarmsSlice = createSlice({
  name: 'alarms',
  initialState: [] as AlarmDocType[],
  reducers: {
    fetchAlarms(_, __: Action) {
      return _;
    },
    mutateAlarm(
      _,
      __: PayloadAction<{ datetime: string; alarm: Partial<AlarmDocType> }>,
    ) {
      return _;
    },
    deleteAlarm(_, __: PayloadAction<AlarmDocType>) {
      return _;
    },
    listAlarms(_, action) {
      return action.payload;
    },
  },
});

export const alarms = alarmsSlice.reducer;
export const { listAlarms, fetchAlarms, mutateAlarm, deleteAlarm } =
  alarmsSlice.actions;

export const listener = createListenerMiddleware({
  extra: {},
});
