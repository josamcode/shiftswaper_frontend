// utils/checkAuthRedirect.js
import Cookies from 'js-cookie';

export const checkAuthStatus = (preferredRedirectPath = '/dashboard') => {
  const employeeToken = Cookies.get('employee_token');
  const SupervisorToken = Cookies.get('supervisor_token');
  const companyToken = Cookies.get('company_token');

  const isLoggedIn = !!employeeToken || !!companyToken || !!SupervisorToken;

  return {
    isLoggedIn,
    redirectPath: isLoggedIn ? preferredRedirectPath : null
  };
};