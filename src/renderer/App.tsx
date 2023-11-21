import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Hello, Alarms } from './pages';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Alarms />} />
        <Route path="/docs" element={<Hello />} />
      </Routes>
    </Router>
  );
}
