import {
  createAction,
  createListenerMiddleware,
  createSlice,
  isAnyOf,
} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AlarmDocType, ClockCollections } from '../../shared/typings';

const alarmsSlice = createSlice({
  name: 'alarms',
  initialState: [] as AlarmDocType[],
  reducers: {
    listAlarms(_, action) {
      return action.payload;
    },
  },
});

export const alarms = alarmsSlice.reducer;
export const { listAlarms } = alarmsSlice.actions;
export const fetchAlarms = createAction('alarms/fetchAlarms');
export const mutateAlarm = createAction<{
  datetime: string;
  alarm: Partial<AlarmDocType>;
}>('alarms/mutateAlarms');
export const deleteAlarm = createAction<AlarmDocType>('alarms/deleteAlarm');
export const isListAlarms = isAnyOf(listAlarms);

export const listener = createListenerMiddleware({
  extra: {} as ClockCollections,
});

