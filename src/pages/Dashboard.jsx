import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ArrowRight, Building2, Users } from 'lucide-react';
import CompanyDashboard from './CompanyDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import ModeratorDashboard from './ModeratorDashboard';

const SIGN_IN_OPTIONS = [
  {
    id: 'company',
    title: 'Company',
    description:
      'For company admins. Review join requests, assign supervisors and keep your employee ID list up to date.',
    icon: Building2,
    tile: 'bg-lavender-200 text-lavender-700',
    primary: { label: 'Company login', to: '/company_login' },
    secondary: { label: 'Create company account', to: '/company_register' },
  },
  {
    id: 'employee',
    title: 'Employee',
    description:
      'For experts, SMEs, supervisors and moderators. Sign in with your email or employee ID.',
    icon: Users,
    tile: 'bg-mint-200 text-mint-700',
    primary: { label: 'Employee login', to: '/employee_login' },
    secondary: { label: 'Join your team', to: '/employee_register' },
  },
];

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  const companyToken = Cookies.get('company_token') || null;
  const supervisorToken = Cookies.get('supervisor_token') || null;
  const employeeToken = Cookies.get('employee_token') || null;
  const moderatorToken = Cookies.get('moderator_token') || null;

  useEffect(() => {
    const checkAuthentication = () => {
      setTimeout(() => {
        if (companyToken) {
          setUserType('company');
        } else if (supervisorToken) {
          setUserType('supervisor');
        } else if (employeeToken) {
          setUserType('employee');
        } else if (moderatorToken) {
          setUserType('moderator');
        }
        setIsLoading(false);
      }, 0);
    };

    checkAuthentication();
  }, [companyToken, employeeToken]);

  // Loading state
  if (isLoading) {
    return (
      <div className="app-page flex items-center justify-center px-5">
        <div className="text-center" role="status" aria-live="polite">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-500"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm text-ink/55">Checking your session…</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on token
  if (userType === 'company') {
    return <CompanyDashboard />;
  } else if (userType === 'supervisor') {
    return <SupervisorDashboard />;
  } else if (userType === 'employee') {
    return <EmployeeDashboard />;
  } else if (userType === 'moderator') {
    return <ModeratorDashboard />;
  }

  // Not signed in: choose how to sign in
  return (
    <div className="app-page">
      <section className="container-site py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Your dashboard</p>
          <h1 className="type-h3 mt-3">Choose how to sign in</h1>
          <p className="type-body mx-auto mt-4 max-w-lg">
            You need to be signed in to view your dashboard. Pick the account you use with Shiftswaper.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:gap-5 md:grid-cols-2">
          {SIGN_IN_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <article key={option.id} className="app-card flex flex-col p-6 sm:p-8">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${option.tile}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-display text-2xl text-ink">{option.title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{option.description}</p>
                <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row sm:flex-wrap">
                  <Link to={option.primary.to} className="btn btn-primary btn-md btn-arrow">
                    {option.primary.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link to={option.secondary.to} className="btn btn-ghost btn-md">
                    {option.secondary.label}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-ink/55">
          Not sure which one?{' '}
          <Link to="/get_started" className="link-arrow">
            Help me choose
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </p>
      </section>
    </div>
  );
};

export default Dashboard;
