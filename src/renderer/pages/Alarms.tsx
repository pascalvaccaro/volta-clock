import { Flex } from 'antd';
import CurrentTime from '../components/CurrentTime';

export default function Alarms() {
  return (
    <Flex gap="middle" justify="around" vertical>
      <CurrentTime />
    </Flex>
  );
}
