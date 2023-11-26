import {
  createAction,
  createSlice,
  createListenerMiddleware,
} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  AlarmDocType,
  AlarmDocument,
  ClockCollections,
} from '../../shared/typings';

const alarmsSlice = createSlice({
  name: 'alarms',
  initialState: [] as AlarmDocType[],
  reducers: {
    listAlarms(_, action: PayloadAction<AlarmDocument[]>) {
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

export const ringAlarm = createAction<AlarmDocType>('alarms/rings');

const ringsSlice = createSlice({
  name: 'rings',
  initialState: [] as AlarmDocType[],
  reducers: {
    addRing(state, action: PayloadAction<AlarmDocType>) {
      return [...state, action.payload];
    },
    stopRing(state, action: PayloadAction<AlarmDocType>) {
      return state.filter(
        (alarm) =>
          alarm.datetime === action.payload.datetime &&
          alarm.name === action.payload.name,
      );
    },
  },
});

export const rings = ringsSlice.reducer;
export const { addRing, stopRing } = ringsSlice.actions;

export const listener = createListenerMiddleware({
  extra: {} as ClockCollections,
});
