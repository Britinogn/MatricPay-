import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Navigate } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import { ProtectedRoute } from "./context/ProtectedRoute";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import OrganizerLayout from "./layouts/OrganizerLayout/OrganizerLayout";

//auth
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

//public
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/HomePage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FAQPage from "./pages/FAQPage";
import SecurityPage from "./pages/SecurityPage";
import PricingPage from "./pages/PricingPage";

// Organizer
import PayoutAccountPage from "./pages/organizer/PayoutAccountPage";
import CampaignListPage from "./pages/organizer/CampaignListPage";
import CreateCampaignPage from "./pages/organizer/CreateCampaignPage";
import CampaignDetailPage from "./pages/organizer/CampaignDetailPage";
import OverviewPage from "./pages/organizer/OverviewPage";
import EditCampaignPage from "./pages/organizer/EditCampaignPage";

import PaymentsPage from "./pages/organizer/PaymentsPage";
import CampaignPaymentsPage from "./pages/organizer/CampaignPaymentsPage";
import ReportsPage from "./pages/organizer/ReportsPage";
import CampaignReportPage from "./pages/organizer/CampaignReportPage";

// Public student flow
import PublicPaymentPage from "./pages/public/PublicPaymentPage";
import PaymentSuccessPage from "./pages/public/PaymentSuccessPage";

// Admin
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

//not found
import NotFoundPage from "./pages/NotFoundPage";

//pwa - Progressive Web App
import { InstallPrompt } from "./components/pwa/InstallPrompt";


function App() {
  return (
      <BrowserRouter>
        <Toaster position="top-center" />
        
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Route>

          {/* Public — no auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pay/:slug" element={<PublicPaymentPage  />} />
          <Route path="/pay/:slug/success" element={<PaymentSuccessPage  />} />

          {/* Organizer — requires auth */}
          <Route element={<ProtectedRoute allowedRoles={["organizer"]} />}>
            <Route path="/dashboard" element={<OrganizerLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="campaigns" element={<CampaignListPage />} />
              <Route path="campaigns/new" element={<CreateCampaignPage />} />
              <Route path="campaigns/:id/edit" element={<EditCampaignPage />} />
              <Route path="campaigns/:id" element={<CampaignDetailPage />} />
              <Route path="payout-account" element={<PayoutAccountPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="payments/:campaignId" element={<CampaignPaymentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/:campaignId" element={<CampaignReportPage />} />
              {/* <Route path="more" element={<MorePage />} /> */}
            </Route>
          </Route>

          {/* Admin — requires auth + admin role */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* inside <Routes>, as the LAST route: */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>

        {/* PWA install prompt */}
        <InstallPrompt />

      </BrowserRouter>
  )
}

export default App;