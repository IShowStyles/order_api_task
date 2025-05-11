import { Suspense } from "react";
import "./App.css";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

const Orders = React.lazy(() => import("./pages/Orders.tsx"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div></div>}>
        <Routes>
          <Route index path="/" element={<Navigate to="/orders" />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
