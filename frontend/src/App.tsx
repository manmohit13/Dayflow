import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Tasks from './Tasks';
import type { JSX } from 'react/jsx-runtime';

function Protected({ children }: { children: JSX.Element }) {
  return localStorage.getItem('jwt') ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}