import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import { type TypedStartListening, configureStore } from '@reduxjs/toolkit';
import type { ClockCollections } from '../../shared/typings';
import { alarms, rings, listener } from './reducers';
import './listeners';

const store = configureStore({
  reducer: {
    alarms,
    rings,
  },
  middleware: [listener.middleware],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type StartAppListening = TypedStartListening<
  RootState,
  AppDispatch,
  ClockCollections
>;

export const useClockDispatch: () => AppDispatch = useDispatch;
export const useClockSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
