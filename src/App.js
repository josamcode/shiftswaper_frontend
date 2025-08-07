import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Home';
import CompanyRegistration from './pages/CompanyRegistration';
import CompanyVerifyOTP from './pages/CompanyVerifyOtp';
import CompanyLogin from './pages/CompanyLogin';
import Header from './components/Header';
import Footer from './components/Footer';
import EmployeeRegistration from './pages/EmployeeRegistration';
import EmployeeVerifyOTP from './pages/EmployeeVerifyOtp';
import EmployeeLogin from './pages/EmployeeLogin';
import RegistrationFlowHandler from './pages/RegistrationFlowHandler';
import { AuthProvider } from './auth/AuthContext';
import NotFoundPage from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import ShiftSwapsPage from './pages/ShiftSwaps';
import DayOffSwapsPage from './pages/DayOffSwaps';
import ScrollToTop from './utils/ScrollToTop';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import Features from './pages/Features';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Header />
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
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;