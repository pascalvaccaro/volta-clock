import {
  AnyAction,
  createAction,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { AlarmDocType, AlarmDocument } from '../../shared/typings';

const alarmsSlice = createSlice({
  name: 'alarms',
  initialState: [] as AlarmDocType[],
  reducers: {
    listAlarms(_, action: PayloadAction<AlarmDocument[]>) {
      return action.payload.map((res) => res.toJSON());
    },
  },
});

export const alarms = alarmsSlice.reducer;
export const { listAlarms } = alarmsSlice.actions;
export const isCancelled = (alarm: AlarmDocType) => (action: AnyAction) =>
  listAlarms.match(action) &&
  !action.payload.find((doc) => doc.active && doc.id === alarm.id);

export const fetchAlarms = createAction('alarms/fetchAlarms');
export const mutateAlarm = createAction<{
  id?: string;
  body: Partial<AlarmDocType>;
}>('alarms/mutateAlarms');
export const deleteAlarm = createAction<string>('alarms/deleteAlarm');

export const ringAlarm = createAction<AlarmDocType>('alarms/rings');

const ringSlice = createSlice({
  name: 'ring',
  initialState: {} as AlarmDocType,
  reducers: {
    setRing(state, action: PayloadAction<AlarmDocType>) {
      return action.payload.active ? action.payload : state;
    },
  },
});

export const ring = ringSlice.reducer;
export const { setRing } = ringSlice.actions;
