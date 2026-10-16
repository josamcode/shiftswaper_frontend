import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout from '../components/layout/LegalLayout';
import { CONTACT_EMAIL } from '../components/Footer';

/** Sub-heading + its content, kept together so the heading sits close to what it introduces. */
const Block = ({ title, children }) => (
  <div className="space-y-3">
    <h3>{title}</h3>
    {children}
  </div>
);

const Email = () => <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <>
        <p>
          Welcome to Shiftswaper! These Terms of Service ("Terms") create a legal agreement between you and Shiftswaper
          for the use of our shift management platform and related services.
        </p>
        <Block title="By using Shiftswaper, you agree to:">
          <ul>
            <li>Follow our community guidelines and acceptable use policies</li>
            <li>Respect other users' privacy and information</li>
            <li>Use the platform only for legitimate business purposes</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </Block>
        <p>
          <strong>Important note:</strong> If you don't agree with these terms, please don't use our services. By
          creating an account or using Shiftswaper, you're accepting these terms.
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    content: (
      <>
        <Block title="Who can use Shiftswaper">
          <ul>
            <li>Businesses and organizations that manage shift-based employees</li>
            <li>Employees aged 18 or older (or with employer authorization if younger)</li>
            <li>Users who provide accurate and complete registration information</li>
            <li>Organizations operating legally in their jurisdiction</li>
          </ul>
        </Block>
        <Block title="Account requirements: company accounts">
          <ul>
            <li>Valid business email address</li>
            <li>Accurate company information</li>
            <li>Authorization to act on behalf of the business</li>
            <li>Compliance with employment laws</li>
          </ul>
        </Block>
        <Block title="Account requirements: employee accounts">
          <ul>
            <li>Valid email address</li>
            <li>Employment with a registered company</li>
            <li>Approval from your employer</li>
            <li>Accurate personal information</li>
          </ul>
        </Block>
        <p>
          <strong>Account security:</strong> You're responsible for maintaining the security of your account
          credentials. Don't share your login information with others.
        </p>
      </>
    ),
  },
  {
    id: 'services',
    title: 'Our Services',
    content: (
      <>
        <p>Shiftswaper provides a comprehensive shift management platform with the following features:</p>
        <Block title="Shift swapping">
          <ul>
            <li>Create and manage shift swap requests</li>
            <li>Receive and make counter offers</li>
            <li>Email notifications for new offers, accepted offers and final decisions</li>
            <li>Supervisor approval workflow</li>
          </ul>
        </Block>
        <Block title="Day-off management">
          <ul>
            <li>Request day-off swaps with colleagues</li>
            <li>Colleagues propose matching days off</li>
            <li>The requester chooses which match to accept</li>
            <li>Approval tracking and management</li>
          </ul>
        </Block>
        <Block title="Company management">
          <ul>
            <li>Employee registration approval</li>
            <li>Supervisor assignment and management</li>
            <li>Overview of all join requests and their status</li>
            <li>Employee ID management</li>
          </ul>
        </Block>
        <Block title="Security & privacy">
          <ul>
            <li>Hashed passwords and signed session tokens</li>
            <li>Role-based access controls</li>
            <li>One-time email codes with resend cooldowns and lockouts</li>
            <li>Privacy protection measures</li>
          </ul>
        </Block>
        <Block title="Service availability">
          <p>
            We work to keep Shiftswaper available, but occasional maintenance and updates may temporarily affect service
            availability. We'll notify users in advance of any planned downtime when possible.
          </p>
        </Block>
      </>
    ),
  },
  {
    id: 'responsibilities',
    title: 'Your Responsibilities',
    content: (
      <>
        <Block title="Account management">
          <ul>
            <li>Keep your account information accurate and up-to-date</li>
            <li>Protect your login credentials and report unauthorized access</li>
            <li>Only create accounts you're authorized to create</li>
            <li>Notify us immediately of any security breaches</li>
          </ul>
        </Block>
        <Block title="Platform usage">
          <ul>
            <li>Use the platform only for legitimate business purposes</li>
            <li>Provide accurate information in all requests and communications</li>
            <li>Respect other users' time and commitments</li>
            <li>Follow your company's internal policies and procedures</li>
          </ul>
        </Block>
        <Block title="Data & privacy">
          <ul>
            <li>Respect the privacy of other users' information</li>
            <li>Don't access or attempt to access unauthorized data</li>
            <li>Report any privacy or security concerns promptly</li>
            <li>Use personal data only as permitted by your role</li>
          </ul>
        </Block>
        <Block title="Legal compliance">
          <ul>
            <li>Comply with all applicable employment laws</li>
            <li>Follow workplace safety and health regulations</li>
            <li>Respect intellectual property rights</li>
            <li>Don't engage in discriminatory or harassing behavior</li>
          </ul>
        </Block>
        <p>
          <strong>Company-specific policies:</strong> Your use of Shiftswaper must also comply with your employer's
          policies, procedures, and any applicable collective bargaining agreements.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    content: (
      <>
        <Block title="What's allowed">
          <ul>
            <li>Creating legitimate shift swap and day-off requests</li>
            <li>Communicating professionally with colleagues and supervisors</li>
            <li>Using the platform to improve work-life balance</li>
            <li>Providing constructive feedback to improve the service</li>
            <li>Accessing only the information you're authorized to see</li>
          </ul>
        </Block>
        <Block title="What's prohibited">
          <ul>
            <li>Creating fake or fraudulent accounts or requests</li>
            <li>Harassing, bullying, or discriminating against other users</li>
            <li>Attempting to access unauthorized areas or data</li>
            <li>Sharing login credentials or allowing unauthorized access</li>
            <li>Using the platform for non-work related activities</li>
            <li>Disrupting or interfering with the platform's operation</li>
            <li>Uploading malicious software or harmful content</li>
            <li>Violating any applicable laws or regulations</li>
          </ul>
        </Block>
        <Block title="Reporting violations">
          <p>
            If you encounter behavior that violates these guidelines, please report it to us immediately at <Email />.
          </p>
        </Block>
        <Block title="Enforcement">
          <p>
            Violations of this policy may result in account suspension or termination, depending on the severity and
            frequency of the violation.
          </p>
        </Block>
      </>
    ),
  },
  {
    id: 'payment',
    title: 'Payment Terms',
    content: (
      <>
        <p>
          Shiftswaper is currently offered without paid plans. There are no subscription fees or trials, and we don't
          ask for or store any payment details.
        </p>
        <Block title="If paid plans are introduced">
          <ul>
            <li>Pricing, billing terms and any refund policy will be presented to you before any charge is made</li>
            <li>You won't be charged unless you explicitly choose a paid plan</li>
            <li>We'll announce the change in advance and update these terms accordingly</li>
          </ul>
        </Block>
        <Block title="Payment failure">
          <p>
            If you choose a paid plan in the future and a payment fails, your account may be suspended until payment is
            resolved. We'll notify you before any suspension occurs.
          </p>
        </Block>
      </>
    ),
  },
  {
    id: 'intellectual',
    title: 'Intellectual Property',
    content: (
      <>
        <Block title="Our rights">
          <p>Shiftswaper owns all rights to our platform, including:</p>
          <ul>
            <li>Software code, algorithms, and technical infrastructure</li>
            <li>Trademarks, logos, and brand materials</li>
            <li>User interface design and user experience</li>
            <li>Documentation, help materials, and content</li>
          </ul>
        </Block>
        <Block title="Your rights">
          <p>You retain ownership of your business data and information, including:</p>
          <ul>
            <li>Employee schedules and shift information</li>
            <li>Company data and organizational information</li>
            <li>Requests, offers and reasons you submit within the platform</li>
            <li>Any content you upload or create</li>
          </ul>
        </Block>
        <Block title="License grant">
          <p>
            We grant you a limited, non-exclusive, non-transferable license to use Shiftswaper for your business
            purposes while your account is active. This license automatically terminates when your account is closed or
            terminated.
          </p>
        </Block>
        <p>
          <strong>Restrictions:</strong> You may not copy, modify, distribute, or reverse engineer our software or
          attempt to extract our source code or proprietary algorithms.
        </p>
      </>
    ),
  },
  {
    id: 'termination',
    title: 'Termination',
    content: (
      <>
        <Block title="Your right to cancel">
          <ul>
            <li>Stop using Shiftswaper at any time</li>
            <li>Ask us to close your account by emailing us</li>
            <li>No cancellation fees or penalties</li>
          </ul>
        </Block>
        <Block title="Our right to terminate">
          <p>We may suspend or terminate accounts for:</p>
          <ul>
            <li>Violation of terms of service</li>
            <li>Abusive or inappropriate behavior</li>
            <li>Non-payment of any fees you have agreed to pay</li>
            <li>Illegal or fraudulent activity</li>
          </ul>
        </Block>
        <Block title="What happens after termination">
          <ul>
            <li>Loss of access to the platform</li>
            <li>Data retention for up to 30 days for potential recovery</li>
            <li>Deletion of your data after the retention period, unless we're required by law to keep it</li>
            <li>Option to request a copy of your data before your account is closed</li>
          </ul>
        </Block>
        <p>
          <strong>Data copies:</strong> You can request a copy of your data at any time while your account is active.
          Email <Email /> and we'll help.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    content: (
      <>
        <Block title="Service availability">
          <p>
            We cannot guarantee uninterrupted service. Maintenance, updates, or technical issues may temporarily affect
            availability.
          </p>
        </Block>
        <Block title="Employment relationships">
          <p>
            Shiftswaper is a tool to facilitate shift management. We are not responsible for employment decisions, workplace
            disputes, or compliance with labor laws. These remain between employers and employees.
          </p>
        </Block>
        <Block title="Limitation of liability">
          <p>
            Our liability is limited to the amount you paid for the service in the past 12 months. We are not liable
            for indirect, incidental, or consequential damages.
          </p>
        </Block>
        <Block title="Data accuracy">
          <p>
            Users are responsible for the accuracy of data entered into the system. We provide tools but cannot
            guarantee the accuracy of user-generated content.
          </p>
        </Block>
        <Block title="Governing law">
          <p>
            These terms are governed by the laws of the jurisdiction in which Shiftswaper is operated. Any disputes
            will be resolved through binding arbitration or in the competent courts of that jurisdiction.
          </p>
        </Block>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: (
      <>
        <p>Questions about these terms? Need help with your account? We're here to assist you.</p>
        <Block title="Legal, terms and general support">
          <p>
            Email <Email /> for questions about these terms, our <Link to="/privacy">Privacy Policy</Link> or other
            legal matters, as well as account issues, technical support, and general questions.
          </p>
        </Block>
        <Block title="Updates to terms">
          <p>We may update these terms from time to time. When we do, we'll:</p>
          <ul>
            <li>Email all registered users about significant changes</li>
            <li>Update the "Last updated" date at the top of this page</li>
            <li>Post a notice on our platform</li>
            <li>Give you at least 30 days notice of material changes</li>
          </ul>
        </Block>
        <Block title="Thank you">
          <p>
            Thank you for choosing Shiftswaper. We're committed to providing you with the best shift management
            experience while maintaining clear, fair terms of service.
          </p>
        </Block>
      </>
    ),
  },
];

const TermsOfService = () => (
  <LegalLayout
    title="Terms of Service"
    intro="These terms govern your use of Shiftswaper. Please read them carefully before using our services."
    lastUpdated="October 16, 2026"
    sections={sections}
  />
);

export default TermsOfService;
