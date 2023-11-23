import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useClockDispatch } from './store';
import { fetchAlarms } from './store/reducers';
import { Hello, Alarms } from './pages';
import Ring from './components/Ring';
import Alarm from './pages/Alarm';
import './App.css';

export default function App() {
  const dispatch = useClockDispatch();
  useEffect(() => {
    dispatch(fetchAlarms());
  }, [dispatch]);

  return (
    <Router>
      <Ring channel="alarm-ring" />
      <Routes>
        <Route path="/" element={<Alarms />} />
        <Route path="/alarms/:datetime?" element={<Alarm />} />
        <Route path="/docs" element={<Hello />} />
      </Routes>
    </Router>
  );
}
