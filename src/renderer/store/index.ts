import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { alarms, rings } from './reducers';
import listener from './listener';
import './epics';

const store = configureStore({
  reducer: {
    alarms,
    rings,
  },
  devTools: false, // handled by electron's main process
  middleware: [listener.middleware],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useClockDispatch: () => AppDispatch = useDispatch;
export const useClockSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
