import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home"


import React from 'react'
import Upload from "./components/ui/Upload";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element = {<Dashboard/>} />
              </Routes>
    </BrowserRouter>
    // <Upload />
  )
}

export default App