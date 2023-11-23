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
    detailAlarm(state, action: PayloadAction<AlarmDocType>) {
      const idx = state.findIndex(
        (item) => item.datetime === action.payload.datetime,
      );
      return idx >= 0
        ? [...state.slice(0, idx), action.payload, ...state.slice(idx + 1)]
        : [...state, action.payload];
    },
  },
});

export const alarms = alarmsSlice.reducer;
export const {
  listAlarms,
  detailAlarm,
  fetchAlarms,
  mutateAlarm,
  deleteAlarm,
} = alarmsSlice.actions;

export const listener = createListenerMiddleware({
  extra: {},
});
