import dayjs from 'dayjs';
import { useCallback } from 'react';
import { Button, Flex, List, Switch } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useClockDispatch, useClockSelector } from '../store';
import { AlarmDocType } from '../../shared/typings';
import CurrentTime from '../components/CurrentTime';
import { mutateAlarm } from '../store/reducers';

export default function Alarms() {
  const alarms = useClockSelector((state) => state.alarms);
  const dispatch = useClockDispatch();
  const toggleActive = useCallback(
    ({ datetime, ...alarm }: AlarmDocType) =>
      (active: boolean) =>
        dispatch(mutateAlarm({ datetime, alarm: { ...alarm, active } })),
    [dispatch],
  );

  return (
    <Flex gap="middle" justify="around" vertical>
      <CurrentTime />
      <List
        header={
          <Link to="/alarms/">
            <Button icon={<PlusSquareOutlined />} />
          </Link>
        }
        itemLayout="horizontal"
        dataSource={alarms}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Switch checked={item.active} onChange={toggleActive(item)} />,
            ]}
          >
            <Link to={`/alarms/${item.datetime}`}>
              <List.Item.Meta title={dayjs(item.datetime).format('HH:mm')} />
            </Link>
          </List.Item>
        )}
      />
    </Flex>
  );
}
