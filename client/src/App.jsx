import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Practice from './pages/Practice';
import History from './pages/History';
import Progress from './pages/Progress';
import SubjectsPage from './pages/SubjectsPage';
import SubjectDetail from './pages/SubjectDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col" style={{ background: '#04060F' }}>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"                      element={<Home />} />
            <Route path="/subjects"              element={<SubjectsPage />} />
            <Route path="/subjects/:subjectName" element={<SubjectDetail />} />
            <Route path="/practice"              element={<Practice />} />
            <Route path="/history"               element={<History />} />
            <Route path="/progress"              element={<Progress />} />
            <Route path="*"                      element={<Navigate to="/subjects" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
