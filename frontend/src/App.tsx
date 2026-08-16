import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
// import { AuthProvider } from "./context/AuthContext";
// import { ProtectedRoute } from "./context/ProtectedRoute";
import { ProtectedRoute } from "./layouts/ProtectedRoute";

//auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";


// Organizer
import PayoutAccountPage from "./pages/organizer/PayoutAccountPage";
import CampaignListPage from "./pages/organizer/CampaignListPage";
import CreateCampaignPage from "./pages/organizer/CreateCampaignPage";
import CampaignDetailPage from "./pages/organizer/CampaignDetailPage";

// Public student flow
import PublicPaymentPage from "./pages/public/PublicPaymentPage";
import PaymentSuccessPage from "./pages/public/PaymentSuccessPage";

// Admin
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";


function App() {
  return (
      <BrowserRouter>
        <Toaster position="top-center" />
        
        <Routes>
          {/* Public — no auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pay/:slug" element={<PublicPaymentPage  />} />
          <Route path="/pay/:slug/success" element={<PaymentSuccessPage  />} />

          {/* Organizer — requires auth */}
          <Route element={<ProtectedRoute allowedRoles={["organizer"]} />}>
            <Route path="/" element={<CampaignListPage />} />
            <Route path="/payout-account" element={<PayoutAccountPage />} />
            <Route path="/campaigns/new" element={<CreateCampaignPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          </Route>

          {/* Admin — requires auth + admin role */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

        </Routes>

      </BrowserRouter>
  )
}

export default App;