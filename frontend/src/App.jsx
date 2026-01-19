import { BrowserRouter, Routes, Route } from "react-router-dom";

// Common Components
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Citizen pages
import CitizenDashboard from "./pages/citizen/Dashboard";
import ComplaintForm from "./pages/citizen/ComplaintForm";
import MyComplaints from "./pages/citizen/MyComplaints";
import TrackStatus from "./pages/citizen/TrackStatus";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageComplaints from "./pages/admin/ManageComplaints";
import ChiefDashboard from "./pages/admin/ChiefDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen (protected) */}
          <Route path="/citizen/dashboard" element={
            <ProtectedRoute role="citizen"><CitizenDashboard /></ProtectedRoute>
          } />
          <Route path="/citizen/complaint" element={
            <ProtectedRoute role="citizen"><ComplaintForm /></ProtectedRoute>
          } />
          <Route path="/citizen/my-complaints" element={
            <ProtectedRoute role="citizen"><MyComplaints /></ProtectedRoute>
          } />
          <Route path="/citizen/track-status" element={
            <ProtectedRoute role="citizen"><TrackStatus /></ProtectedRoute>
          } />

          {/* Admin (protected) */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role={['admin', 'chief']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/manage" element={
            <ProtectedRoute role={['admin', 'chief']}><ManageComplaints /></ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute role={['admin', 'chief']}><ChiefDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute role={['admin', 'chief']}><ChiefDashboard /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
