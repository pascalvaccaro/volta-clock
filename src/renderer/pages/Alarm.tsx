import dayjs from 'dayjs';
import { useCallback, useReducer } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, DatePicker, Flex, Input, TimePicker } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useClockDispatch, useClockSelector } from '../store';
import { deleteAlarm, mutateAlarm } from '../store/reducers';
import reducer, { setDate, setTime, setName, selector } from '../store/alarm';

type AlarmProps = {
  timeFormat?: string;
  dateFormat?: string;
};

function Alarm({ timeFormat, dateFormat }: AlarmProps) {
  const { datetime = dayjs().add(1, 'minute').toISOString() } = useParams<{
    datetime: string;
  }>();
  const initState = useClockSelector((state) => selector(state, datetime));
  const navigate = useNavigate();
  const finalize = useClockDispatch();
  const [alarm, dispatch] = useReducer(reducer, initState);

  const onSubmit = useCallback(() => {
    const now = dayjs();
    if (now.isAfter(alarm.datetime)) return;
    finalize(mutateAlarm({ datetime, alarm }));
    navigate('/');
  }, [datetime, alarm, finalize, navigate]);

  const onClickRemove = useCallback(() => {
    finalize(deleteAlarm(alarm));
    navigate('/');
  }, [alarm, finalize, navigate]);

  return (
    <>
      <Flex
        justify="center"
        align="center"
        vertical
        gap="large"
        style={{ padding: 24, flexGrow: 1 }}
      >
        <TimePicker
          format={timeFormat}
          value={dayjs(alarm.datetime)}
          onChange={(payload) => dispatch(setTime(payload))}
          style={{ minWidth: 200 }}
        />
        <Input
          placeholder="Nom de l'alarme"
          value={alarm.name ?? ''}
          onChange={(payload) => dispatch(setName(payload))}
          style={{ maxWidth: 200 }}
        />
        <DatePicker
          format={dateFormat}
          value={dayjs(alarm.datetime)}
          onChange={(payload) => dispatch(setDate(payload))}
          style={{ minWidth: 200 }}
        />
      </Flex>
      <Flex justify="space-around" style={{ margin: 12 }}>
        <Button size="large" type="default">
          <Link to="/">Annuler</Link>
        </Button>
        <Button
          size="large"
          type="default"
          danger
          onClick={onClickRemove}
          icon={<DeleteOutlined />}
        />
        <Button size="large" type="primary" onClick={onSubmit}>
          Enregistrer
        </Button>
      </Flex>
    </>
  );
}

Alarm.defaultProps = {
  timeFormat: 'HH:mm',
  dateFormat: 'D MM YYYY',
};

export default Alarm;
