import dayjs from 'dayjs';
import { useCallback } from 'react';
import { Button, Flex, List, Switch, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useClockDispatch, useClockSelector } from '../store';
import { AlarmDocType } from '../../shared/typings';
import { mutateAlarm } from '../store/reducers';

export default function Alarms() {
  const alarms = useClockSelector((state) => state.alarms);
  const dispatch = useClockDispatch();
  const toggleActive = useCallback(
    ({ id, ...alarm }: AlarmDocType) =>
      (active: boolean) =>
        dispatch(mutateAlarm({ id, body: { ...alarm, active } })),
    [dispatch],
  );

  return (
    <Flex gap="middle" justify="around" vertical>
      <List
        header={
          <Flex justify="end" style={{ marginRight: 32 }}>
            <Link to="/alarms/">
              <Button shape="circle" type="primary" icon={<PlusOutlined />} />
            </Link>
          </Flex>
        }
        itemLayout="horizontal"
        dataSource={alarms}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Switch checked={item.active} onChange={toggleActive(item)} />,
            ]}
            style={{ padding: '0px 24px' }}
          >
            <Link to={`/alarms/${item.id}`}>
              <Typography.Title level={3} style={{ marginTop: 12 }}>
                {dayjs(item.datetime).format('HH:mm')}
              </Typography.Title>
              <Typography.Paragraph>
                {dayjs(item.datetime).format('ddd D MMM')} <b>{item.name}</b>
              </Typography.Paragraph>
            </Link>
          </List.Item>
        )}
      />
    </Flex>
  );
}
