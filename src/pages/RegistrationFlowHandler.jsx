import React, { useEffect, useState } from 'react';
import { Building2, UserRound, ArrowLeft, Check, CheckCircle2, ChevronRight, Loader2, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import AuthLayout from '../components/layout/AuthLayout';
import { CONTACT_EMAIL } from '../components/Footer';

// Configuration object for easy customization
const registrationConfig = {
  questions: [
    {
      id: 'userType',
      title: 'How will you use Shiftswaper?',
      subtitle: 'Welcome! Choose the account type that fits you.',
      type: 'choice',
      options: [
        {
          id: 'company',
          title: 'Company',
          subtitle: 'Register your business, whitelist employee IDs and approve who joins.',
          icon: Building2,
          color: 'lavender'
        },
        {
          id: 'employee',
          title: 'Employee',
          subtitle: 'Join your company and swap shifts and days off with colleagues.',
          icon: UserRound,
          color: 'brand'
        }
      ]
    },
    {
      id: 'actionType',
      title: 'What would you like to do?',
      subtitle: 'Create a new account or log in to an existing one.',
      type: 'choice',
      options: [
        {
          id: 'register',
          title: 'Create a new account',
          subtitle: 'I’m new to Shiftswaper',
          icon: UserPlus,
          color: 'mint'
        },
        {
          id: 'login',
          title: 'Log in',
          subtitle: 'I already have an account',
          icon: LogIn,
          color: 'butter'
        }
      ]
    }
  ],
  routes: {
    'company-register': '/company_register',
    'company-login': '/company_login',
    'employee-register': '/employee_register',
    'employee-login': '/employee_login'
  },
  messages: {
    company: {
      register: {
        title: 'Company Registration',
        description: 'Create your company account, verify it by email, then set up the employee IDs your team will use to join.',
        features: ['Verify your company by email', 'Whitelist or import employee IDs', 'Approve join requests and assign supervisors']
      },
      login: {
        title: 'Company Login',
        description: 'Access your company dashboard to review join requests and manage employee IDs.',
        features: ['Review join requests', 'Manage employee IDs', 'Bulk import from Excel or CSV']
      }
    },
    employee: {
      register: {
        title: 'Employee Registration',
        description: 'Submit a request to join your company, then swap shifts and days off with your colleagues once approved.',
        features: ['Request to join your company', 'Post shift and day-off swap requests', 'Send offers on colleagues’ requests']
      },
      login: {
        title: 'Employee Login',
        description: 'Access your dashboard to follow your swap requests and offers.',
        features: ['Track your requests', 'Accept offers from colleagues', 'See supervisor decisions']
      }
    }
  }
};

// Pastel icon-tile tones for the option cards.
const TONES = {
  lavender: 'bg-lavender-200 text-lavender-700',
  brand: 'bg-brand-100 text-brand-700',
  mint: 'bg-mint-200 text-mint-700',
  butter: 'bg-butter-200 text-butter-700'
};

// Registration Flow Handler Component
const RegistrationFlowHandler = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isNavigating, setIsNavigating] = useState(false);

  const currentQuestion = registrationConfig.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === registrationConfig.questions.length - 1;
  const canGoBack = currentQuestionIndex > 0;

  useEffect(() => {
    const employeeToken = Cookies.get('employee_token');
    const companyToken = Cookies.get('company_token');

    if (employeeToken || companyToken) {
      navigate('/dashboard');
    }
  }, [navigate]);


  const handleAnswer = (optionId) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Process final answers and navigate
      handleFinalSubmit(newAnswers);
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleFinalSubmit = (finalAnswers) => {
    setIsNavigating(true);

    // Construct route key from answers
    const userType = finalAnswers.userType;
    const actionType = finalAnswers.actionType;
    const routeKey = `${userType}-${actionType}`;
    const targetRoute = registrationConfig.routes[routeKey];

    // Simulate brief loading for better UX
    setTimeout(() => {
      if (navigate && targetRoute) {
        navigate(targetRoute, {
          state: {
            flowData: finalAnswers,
            message: getNavigationMessage(finalAnswers)
          }
        });
      } else {
        setIsNavigating(false);
        handleStartOver();
      }
    }, 500);
  };

  const getNavigationMessage = (finalAnswers) => {
    const userType = finalAnswers.userType;
    const actionType = finalAnswers.actionType;
    return registrationConfig.messages[userType]?.[actionType];
  };

  const handleGoBack = () => {
    if (canGoBack) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleStartOver = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsNavigating(false);
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / registrationConfig.questions.length) * 100;
  };

  const getBreadcrumb = () => {
    const breadcrumbs = [];

    if (answers.userType) {
      const userTypeOption = registrationConfig.questions[0].options.find(opt => opt.id === answers.userType);
      breadcrumbs.push(userTypeOption?.title);
    }

    if (answers.actionType) {
      const actionTypeOption = registrationConfig.questions[1].options.find(opt => opt.id === answers.actionType);
      breadcrumbs.push(actionTypeOption?.title);
    }

    return breadcrumbs;
  };

  const supportFooter = (
    <p>
      Having trouble?{' '}
      <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
        Contact support
      </a>
    </p>
  );

  if (isNavigating) {
    const navigationMessage = getNavigationMessage(answers);

    return (
      <AuthLayout aside={false}>
        <div className="py-6 text-center" role="status" aria-live="polite">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-200 text-mint-700 animate-scale-in">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-[30px] leading-tight text-ink sm:text-[34px]">Great choice</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/60">
            Redirecting you to {navigationMessage?.title?.toLowerCase() || 'your destination'}...
          </p>
          <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin text-brand-500" aria-hidden="true" />
        </div>
      </AuthLayout>
    );
  }

  const breadcrumb = getBreadcrumb();
  const totalSteps = registrationConfig.questions.length;

  return (
    <AuthLayout aside={false} footer={supportFooter}>
      {/* Back Button */}
      {canGoBack && (
        <button
          type="button"
          onClick={handleGoBack}
          className="-ml-1 mb-5 inline-flex h-10 items-center gap-1.5 rounded-full pl-1 pr-3 text-sm font-medium text-ink/55 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
      )}

      {/* Progress */}
      <div className="flex items-center gap-4">
        <p className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/45">
          Step {currentQuestionIndex + 1} of {totalSteps}
        </p>
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.08]"
          role="progressbar"
          aria-label="Sign-up progress"
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={currentQuestionIndex + 1}
        >
          <div
            className="h-full rounded-full bg-brand-500 transition-[width] duration-500 ease-out-expo"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      <div key={currentQuestion.id} className="animate-fade-up">
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-1.5 text-sm">
            {breadcrumb.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink/35" aria-hidden="true" />}
                <span className="chip bg-sand-200 px-3 text-[13px] font-medium text-ink/75">
                  <Check className="h-3.5 w-3.5 text-mint-700" aria-hidden="true" />
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Question */}
        <h1 className={`${breadcrumb.length > 0 ? 'mt-4' : 'mt-7'} font-display text-[30px] leading-tight text-ink sm:text-[34px]`}>
          {currentQuestion.title}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{currentQuestion.subtitle}</p>

        {/* Options */}
        <div className="mt-7 space-y-3">
          {currentQuestion.options.map((option) => {
            const IconComponent = option.icon;
            const isSelected = answers[currentQuestion.id] === option.id;
            const preview =
              currentQuestion.id === 'actionType' ? registrationConfig.messages[answers.userType]?.[option.id] : null;

            return (
              <button
                type="button"
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                aria-pressed={isSelected}
                className={`group relative flex w-full flex-col gap-4 rounded-2xl border bg-white p-5 text-left transition-all duration-200 ease-out-quart hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lift active:translate-y-0 sm:flex-row sm:items-start sm:p-6 ${
                  isSelected ? 'border-brand-500 shadow-ring' : 'border-ink/10 shadow-soft'
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONES[option.color] || TONES.brand}`}
                >
                  <IconComponent className="h-[22px] w-[22px]" aria-hidden="true" />
                </span>
                <span className="block min-w-0 flex-1 sm:pr-2">
                  <span className="block font-display text-[21px] leading-tight text-ink">{option.title}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-ink/60">{option.subtitle}</span>
                  {preview && (
                    <span className="mt-3 block space-y-1">
                      {preview.features.map((feature) => (
                        <span key={feature} className="flex items-start gap-1.5 text-[13px] leading-snug text-ink/60">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-700" aria-hidden="true" />
                          {feature}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <ChevronRight
                  className="absolute right-5 top-8 h-5 w-5 shrink-0 text-ink/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-500 sm:static sm:mt-3.5"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        {/* Start Over */}
        {currentQuestionIndex > 0 && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleStartOver}
              className="inline-flex min-h-[40px] items-center px-3 text-sm font-medium text-ink/55 transition-colors hover:text-ink"
            >
              Start over
            </button>
          </div>
        )}
      </div>

      {/* Preview Information */}
      {answers.userType && answers.actionType && (
        <div className="card-sand mt-6 p-5">
          {(() => {
            const message = getNavigationMessage(answers);
            return message ? (
              <>
                <h2 className="font-display text-xl text-ink">{message.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{message.description}</p>
                <ul className="mt-3 space-y-1.5">
                  {message.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-1.5 text-[13px] text-ink/70">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-700" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null;
          })()}
        </div>
      )}
    </AuthLayout>
  );
};

export default RegistrationFlowHandler;
