import React, { useEffect, useState } from 'react';
import { Building, User, ArrowRight, ArrowLeft, CheckCircle, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Configuration object for easy customization
const registrationConfig = {
  questions: [
    {
      id: 'userType',
      title: 'Who are you?',
      subtitle: 'Choose your account type to get started',
      type: 'choice',
      options: [
        {
          id: 'company',
          title: 'Company',
          subtitle: 'Register your business and manage employees',
          icon: Building,
          color: 'blue'
        },
        {
          id: 'employee',
          title: 'Employee',
          subtitle: 'Join a company and swap shifts with colleagues',
          icon: User,
          color: 'gray'
        }
      ]
    },
    {
      id: 'actionType',
      title: 'What would you like to do?',
      subtitle: 'Choose your next action',
      type: 'choice',
      options: [
        {
          id: 'register',
          title: 'Create New Account',
          subtitle: 'Register for the first time',
          icon: UserPlus,
          color: 'green'
        },
        {
          id: 'login',
          title: 'Sign In',
          subtitle: 'I already have an account',
          icon: LogIn,
          color: 'blue'
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
        description: 'Create your company account to start managing employee schedules and shift swapping.',
        features: ['Manage employee requests', 'Approve shift swaps', 'Monitor attendance', 'Generate reports']
      },
      login: {
        title: 'Company Login',
        description: 'Access your company dashboard to manage employees and oversee shift operations.',
        features: ['Employee management', 'Shift oversight', 'Analytics dashboard', 'Settings control']
      }
    },
    employee: {
      register: {
        title: 'Employee Registration',
        description: 'Submit a request to join your company and start swapping shifts with your colleagues.',
        features: ['Request to join company', 'Swap shifts with colleagues', 'Manage your schedule', 'Time-off requests']
      },
      login: {
        title: 'Employee Login',
        description: 'Access your employee dashboard to manage shifts and coordinate with your team.',
        features: ['View your schedule', 'Request shift swaps', 'Manage time off', 'Team coordination']
      }
    }
  }
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

  if (isNavigating) {
    const navigationMessage = getNavigationMessage(answers);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Perfect Choice!</h2>
          <p className="text-gray-600">
            Redirecting you to {navigationMessage?.title?.toLowerCase() || 'your destination'}...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Shiftswaper</h1>
          <p className="text-gray-600">Let's get you set up with the perfect account</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm text-gray-500">{currentQuestionIndex + 1} of {registrationConfig.questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Breadcrumb */}
        {getBreadcrumb().length > 0 && (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              {getBreadcrumb().map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ArrowRight className="h-3 w-3" />}
                  <span className="font-medium">{crumb}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Back Button */}
          {canGoBack && (
            <button
              onClick={handleGoBack}
              className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          )}

          {/* Question */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {currentQuestion.title}
            </h2>
            <p className="text-gray-600 text-lg">
              {currentQuestion.subtitle}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => {
              const IconComponent = option.icon;
              const isSelected = answers[currentQuestion.id] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg group ${option.color === 'blue'
                    ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                    : option.color === 'gray'
                      ? 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      : option.color === 'green'
                        ? 'border-green-200 hover:border-green-400 hover:bg-green-50'
                        : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${option.color === 'blue'
                      ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                      : option.color === 'gray'
                        ? 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        : option.color === 'green'
                          ? 'bg-green-100 text-green-600 group-hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <ArrowRight className={`h-5 w-5 ml-auto transition-transform duration-200 ${option.color === 'blue' ? 'text-blue-400' :
                      option.color === 'gray' ? 'text-gray-400' :
                        option.color === 'green' ? 'text-green-400' : 'text-gray-400'
                      } group-hover:translate-x-1`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600">
                    {option.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Start Over */}
          {currentQuestionIndex > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={handleStartOver}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Start over
              </button>
            </div>
          )}
        </div>

        {/* Preview Information */}
        {answers.userType && answers.actionType && (
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-white p-6">
            <div className="text-center">
              {(() => {
                const message = getNavigationMessage(answers);
                return message ? (
                  <>
                    <h3 className="text-xl font-semibold mb-2">{message.title}</h3>
                    <p className="text-blue-100 mb-4">{message.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {message.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-blue-100">
                          <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Having trouble? <a href="#support" className="text-blue-600 hover:text-blue-700">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFlowHandler;