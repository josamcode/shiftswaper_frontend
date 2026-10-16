import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Homepage from './pages/Home';
import Header from './components/Header';
import Footer, { AppFooter } from './components/Footer';
import { AuthProvider } from './auth/AuthContext';
import ScrollToTop from './utils/ScrollToTop';
import RouteMeta from './utils/RouteMeta';

// Everything except the homepage is split into its own chunk.
const CompanyRegistration = lazy(() => import('./pages/CompanyRegistration'));
const CompanyVerifyOTP = lazy(() => import('./pages/CompanyVerifyOtp'));
const CompanyLogin = lazy(() => import('./pages/CompanyLogin'));
const EmployeeRegistration = lazy(() => import('./pages/EmployeeRegistration'));
const EmployeeVerifyOTP = lazy(() => import('./pages/EmployeeVerifyOtp'));
const EmployeeLogin = lazy(() => import('./pages/EmployeeLogin'));
const RegistrationFlowHandler = lazy(() => import('./pages/RegistrationFlowHandler'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ShiftSwapsPage = lazy(() => import('./pages/ShiftSwaps'));
const DayOffSwapsPage = lazy(() => import('./pages/DayOffSwaps'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Features = lazy(() => import('./pages/Features'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Auth screens render their own focused chrome (see components/layout/AuthLayout).
const AUTH_ROUTES = [
  '/company_register',
  '/company_verify_otp',
  '/company_login',
  '/forgot-password',
  '/reset-password',
  '/employee_register',
  '/employee_verify_otp',
  '/employee_login',
  '/get_started',
];
const APP_ROUTES = ['/dashboard', '/shift_swaps', '/day_off_swaps'];

const PageFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-canvas" role="status" aria-live="polite">
    <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500/20 border-t-brand-500" />
    <span className="sr-only">Loading…</span>
  </div>
);

const Shell = ({ children }) => {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';

  if (AUTH_ROUTES.includes(path)) return children;

  const isApp = APP_ROUTES.includes(path);
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant={isApp ? 'app' : 'marketing'} />
      <main id="main" className="flex-1">
        {children}
      </main>
      {isApp ? <AppFooter /> : <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <RouteMeta />
        <Shell>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/home" element={<Homepage />} />
              <Route path="/company_register" element={<CompanyRegistration />} />
              <Route path="/company_verify_otp" element={<CompanyVerifyOTP />} />
              <Route path="/company_login" element={<CompanyLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/employee_register" element={<EmployeeRegistration />} />
              <Route path="/employee_verify_otp" element={<EmployeeVerifyOTP />} />
              <Route path="/employee_login" element={<EmployeeLogin />} />
              <Route path="/get_started" element={<RegistrationFlowHandler />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/shift_swaps" element={<ShiftSwapsPage />} />
              <Route path="/day_off_swaps" element={<DayOffSwapsPage />} />
              <Route path="/how_it_works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookie_policy" element={<CookiePolicy />} />
              <Route path="/features" element={<Features />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Shell>
      </Router>
    </AuthProvider>
  );
}

export default App;
