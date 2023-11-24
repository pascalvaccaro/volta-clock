import dayjs from 'dayjs';
import { useCallback, useReducer, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, DatePicker, Flex, Input, Layout, TimePicker } from 'antd';
import { useClockDispatch, useClockSelector } from '../store';
import { mutateAlarm } from '../store/reducers';
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
  const [alarm, dispatch] = useReducer(reducer, initState);
  const time = useMemo(() => {
    const datetime = dayjs(alarm.datetime);
    return dayjs(datetime.isAfter() ? datetime : dayjs(), timeFormat);
  }, [alarm, timeFormat]);

  const navigate = useNavigate();
  const finalize = useClockDispatch();
  const onSubmit = useCallback(() => {
    const now = dayjs();
    if (now.isAfter(alarm.datetime)) return;
    finalize(mutateAlarm({ datetime, alarm }));
    navigate('/');
  }, [datetime, alarm, finalize, navigate]);

  return (
    <Layout style={{ height: '100%', background: 'unset' }}>
      <Layout.Content>
        <Flex
          justify="center"
          align="center"
          vertical
          gap="large"
          style={{ height: '100%', padding: 24 }}
        >
          <TimePicker
            format={timeFormat}
            value={time}
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
      </Layout.Content>
      <Layout.Footer style={{ padding: '16px 0px', background: 'unset' }}>
        <Flex justify="space-around">
          <Button size="large" type="default">
            <Link to="/">Annuler</Link>
          </Button>
          <Button size="large" type="primary" onClick={onSubmit}>
            Enregistrer
          </Button>
        </Flex>
      </Layout.Footer>
    </Layout>
  );
}

Alarm.defaultProps = {
  timeFormat: 'HH:mm',
  dateFormat: 'D MM YYYY',
};

export default Alarm;
