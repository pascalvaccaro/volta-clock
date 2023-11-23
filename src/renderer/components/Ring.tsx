import React, { useEffect } from 'react';
import type { Channels } from '../../shared/typings';

type RingProps = React.PropsWithChildren<{ channel: Channels }>;
export default function Ring({ channel }: RingProps) {
  useEffect(
    () =>
      window.electron.ipcRenderer.on(channel, (body) => {
        const now = new Date();
        console.log(channel, body, now.getSeconds(), now.getMilliseconds());
      }),
    [channel],
  );
  return null;
}
