import type { ChangeEvent } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  type Selector,
  type PayloadAction,
  createSlice,
  createSelector,
} from '@reduxjs/toolkit';
import type { AlarmDocType } from '../../shared/typings';
import type { RootState } from '.';

const { actions, reducer } = createSlice({
  name: 'alarm',
  initialState: {} as AlarmDocType,
  reducers: {
    setDate(state, action: PayloadAction<Dayjs | null>) {
      const time = dayjs(state.datetime);
      const date = dayjs(action.payload);
      const datetime = date
        .set('hour', time.get('hour'))
        .set('second', time.get('second'))
        .toISOString();
      return { ...state, datetime };
    },
    setTime(state, action: PayloadAction<Dayjs | null>) {
      const time = dayjs(action.payload);
      const date = dayjs(state.datetime);
      const datetime = time
        .set('day', date.get('day'))
        .set('month', date.get('month'))
        .set('year', date.get('year'))
        .toISOString();
      return { ...state, datetime };
    },
    setName(state, action: PayloadAction<ChangeEvent<HTMLInputElement>>) {
      return { ...state, name: action.payload.target.value };
    },
  },
});

export const { setTime, setDate, setName } = actions;
export default reducer;

const selectAlarms: Selector<RootState, RootState['alarms']> = (state) =>
  state.alarms;
const selectAlarm = (_: RootState, id?: string) => id;

export const selector = createSelector(
  [selectAlarms, selectAlarm],
  (items, id) =>
    items.find((i) => i.id === id) ??
    ({ datetime: dayjs().add(1, 'minute').toISOString() } as AlarmDocType),
);
