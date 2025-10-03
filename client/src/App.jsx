
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SchemaManager from "./components/SchemaManager";
import ClassDetails from "./components/ClassDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ padding: 32, fontFamily: 'Arial' }}>
            <h1>Student Exams Records And Attendance Manager</h1>
            <SchemaManager />
          </div>
        } />
        <Route path="/class" element={<ClassDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
