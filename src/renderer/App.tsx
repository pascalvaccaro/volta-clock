import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Flex } from 'antd';
import { useClockDispatch } from './store';
import { fetchAlarms, ringAlarm } from './store/reducers';
import { Alarms, Alarm } from './pages';
import Ring from './components/Ring';
import './App.css';

export default function App() {
  const dispatch = useClockDispatch();
  useEffect(() => {
    dispatch(fetchAlarms());
  }, [dispatch]);

  return (
    <Router>
      <Ring channel="alarm-ring" onAlarm={ringAlarm} />
      <Flex vertical style={{ height: 'calc(100% - 68px)' }}>
        <Routes>
          <Route path="/" element={<Alarms />} />
          <Route path="/alarms/:id?" element={<Alarm />} />
        </Routes>
      </Flex>
    </Router>
  );
}
