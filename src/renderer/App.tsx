import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Hello, Alarms } from './pages';
import Ring from './components/Ring';

export default function App() {
  return (
    <Router>
      <Ring channel="alarm-ring" />
      <Routes>
        <Route path="/" element={<Alarms />} />
        <Route path="/docs" element={<Hello />} />
      </Routes>
    </Router>
  );
}
