import dayjs from 'dayjs';
import React, { useCallback, useEffect } from 'react';
import { notification } from 'antd';
import type { AlarmDocType, Channels } from '../../shared/typings';
import { useIpcRenderer } from '../hooks/ipc';
import { useClockSelector, useClockDispatch } from '../store';
import { ringAlarm, stopRing } from '../store/reducers';
import { highBip, useSound } from '../hooks/audio';
import CurrentTime from './CurrentTime';

type RingProps = React.PropsWithChildren<{ channel: Channels }>;
export default function Ring({ channel }: RingProps) {
  const rings = useClockSelector((state) => state.rings);
  const play = useSound({ sampleRate: 44100 });
  const dispatch = useClockDispatch();
  const [api, context] = notification.useNotification({
    placement: 'top',
  });

  const ring = useCallback(
    (alarm: AlarmDocType) => {
      const duration = (alarm.duration ?? 1) * 60;
      const source = play(highBip, duration);
      api.warning({
        message: dayjs(alarm.datetime).format('HH:mm'),
        duration,
        description: alarm.name,
        onClose: () => {
          source.disconnect();
          dispatch(stopRing(alarm));
        },
      });
    },
    [api, dispatch, play],
  );

  useIpcRenderer({ channel, onAlarm: ringAlarm });
  useEffect(() => {
    if (rings.length) rings.forEach(ring);
  }, [ring, rings]);

  return (
    <>
      {context}
      <CurrentTime />
    </>
  );
}
