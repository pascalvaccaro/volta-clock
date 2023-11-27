import { useEffect } from 'react';
import { PayloadActionCreator } from '@reduxjs/toolkit';
import type { AlarmDocType, Channels } from '../../shared/typings';
import { useClockDispatch } from '../store';

export type UseIpcRendererProps = {
  onAlarm: PayloadActionCreator<AlarmDocType>;
  channel: Channels;
};
// eslint-disable-next-line import/prefer-default-export
export const useIpcRenderer = ({ onAlarm, channel }: UseIpcRendererProps) => {
  const dispatch = useClockDispatch();

  useEffect(
    () =>
      window.electron.ipcRenderer.on<AlarmDocType[]>(channel, (body) => {
        const now = new Date();
        // eslint-disable-next-line no-console
        console.log(channel, body, now.getSeconds(), now.getMilliseconds());
        body.forEach((alarm) => dispatch(onAlarm(alarm)));
      }),
    [channel, dispatch, onAlarm],
  );
};
