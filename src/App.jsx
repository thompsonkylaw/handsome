import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AssessmentForm from './components/AssessmentForm';
import ReportList from './components/ReportList';
import ReportDetail from './components/ReportDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AssessmentForm />} />
        <Route path="/reports" element={<ReportList />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
