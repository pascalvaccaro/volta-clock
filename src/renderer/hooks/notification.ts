import dayjs from 'dayjs';
import { useCallback } from 'react';
import type { NotificationConfig } from 'antd/es/notification/interface';
import { notification } from 'antd';
import { useSound, type Sound } from './audio';
import type { AlarmDocType } from '../../shared/typings';

export type UseNotificationsProps = {
  bip: Sound;
  onClick?: () => void;
  onClose?: (arg: AlarmDocType) => void;
} & NotificationConfig;
export const useNotifications = ({
  bip,
  onClick,
  onClose,
  placement = 'top',
}: UseNotificationsProps) => {
  const play = useSound({ sampleRate: 44100 });
  const [api, context] = notification.useNotification({
    placement,
  });

  const open = useCallback(
    (alarm: AlarmDocType) => {
      const duration = (alarm.duration ?? 1) * 60;
      const source = play(bip, duration);
      api.warning({
        key: alarm.id,
        message: dayjs(alarm.datetime).format('HH:mm'),
        duration,
        description: alarm.name,
        onClick,
        onClose: () => {
          source.disconnect();
          if (typeof onClose === 'function') onClose(alarm);
        },
      });
    },
    [api, bip, onClick, onClose, play],
  );

  return [open, context] as const;
};
