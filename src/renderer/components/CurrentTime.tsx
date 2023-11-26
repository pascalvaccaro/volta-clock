import dayjs from 'dayjs';
import { Flex, Typography } from 'antd';
import { useState } from 'react';
import { useRafLoop } from '../hooks/raf';

export default function CurrentTime() {
  const [current, setCurrent] = useState(dayjs());
  useRafLoop(() => setCurrent(dayjs()), true);

  return (
    <Flex justify="center">
      <Typography.Title level={3}>
        {current.format('HH:mm:ss')}
      </Typography.Title>
    </Flex>
  );
}
