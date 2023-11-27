import React, { useCallback, useEffect } from 'react';
import { useClockSelector, useClockDispatch } from '../store';
import { highBip as bip } from '../hooks/audio';
import { useIpcRenderer, type UseIpcRendererProps } from '../hooks/ipc';
import { useNotifications } from '../hooks/notification';
import { mutateAlarm } from '../store/reducers';
import type { AlarmDocType } from '../../shared/typings';
import CurrentTime from './CurrentTime';

type RingProps = React.PropsWithChildren<UseIpcRendererProps>;
export default function Ring({ channel, onAlarm }: RingProps) {
  const ring = useClockSelector((state) => state.ring);
  const dispatch = useClockDispatch();
  const onClose = useCallback(
    ({ id }: AlarmDocType) =>
      dispatch(mutateAlarm({ id, body: { active: false } })),
    [dispatch],
  );
  const [show, context] = useNotifications({ bip, onClose });
  useIpcRenderer({ channel, onAlarm });

  useEffect(() => {
    if (ring.active) show(ring);
  }, [ring, show]);

  return (
    <>
      {context}
      <CurrentTime />
    </>
  );
}
