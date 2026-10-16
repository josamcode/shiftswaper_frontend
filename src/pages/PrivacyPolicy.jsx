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
          At Shiftswaper, we believe your privacy is fundamental. This policy outlines how we collect, use, and
          protect your personal information when you use our shift management platform.
        </p>
        <Block title="Key points">
          <ul>
            <li>We only collect information necessary to provide our service</li>
            <li>Your data is never sold to third parties</li>
            <li>You have control over your personal information</li>
            <li>We use industry-standard security measures</li>
          </ul>
        </Block>
        <p>
          This policy applies to all users of Shiftswaper — whether you're a company owner, supervisor, moderator, or
          employee. If you have any questions, please don't hesitate to contact us.
        </p>
      </>
    ),
  },
  {
    id: 'collection',
    title: 'Data Collection',
    content: (
      <>
        <Block title="Account information">
          <ul>
            <li>Full name, account name and email address</li>
            <li>Phone number (provided by companies at registration and by employees when requesting to join)</li>
            <li>Company name, description and logo (company accounts)</li>
            <li>Employee ID, position and assigned supervisor (employee accounts)</li>
            <li>Your password, which we store only as a secure hash — never in readable form</li>
          </ul>
        </Block>
        <Block title="Shift management data">
          <ul>
            <li>Shift swap requests, including dates, times, overtime and the reason you give</li>
            <li>Day-off swap requests and the matches colleagues propose</li>
            <li>Counter-offers, approval decisions and rejection reasons</li>
            <li>Join requests and the company's decision on them</li>
          </ul>
        </Block>
        <Block title="Usage information">
          <ul>
            <li>Dates and times when requests, offers and decisions are created or updated</li>
            <li>
              One-time email codes and related security data (such as when a code was last sent and the number of
              wrong attempts)
            </li>
            <li>
              Standard technical information your browser sends with each request, such as IP address and browser
              type, which is processed to deliver the service and for security purposes
            </li>
          </ul>
        </Block>
        <p>
          <strong>Note:</strong> We never collect sensitive personal information like social security numbers, bank
          details, or personal health information unless specifically required and authorized.
        </p>
      </>
    ),
  },
  {
    id: 'usage',
    title: 'How We Use Data',
    content: (
      <>
        <p>We use your information solely to provide and improve our shift management services:</p>
        <Block title="Service delivery">
          <ul>
            <li>Process shift swap and day-off swap requests</li>
            <li>Send email notifications for new offers, accepted offers and final decisions</li>
            <li>Facilitate communication between users</li>
            <li>Route requests to the right supervisor for approval</li>
          </ul>
        </Block>
        <Block title="Account security">
          <ul>
            <li>Verify user identities with one-time email codes</li>
            <li>Prevent unauthorized access</li>
            <li>Limit repeated wrong codes with resend cooldowns and temporary lockouts</li>
          </ul>
        </Block>
        <Block title="Platform improvement">
          <ul>
            <li>Fix bugs and improve features</li>
            <li>Develop new functionality</li>
            <li>Optimize performance</li>
          </ul>
        </Block>
        <Block title="Communication">
          <ul>
            <li>Send important system updates</li>
            <li>Provide customer support</li>
            <li>Share platform announcements</li>
            <li>Respond to your inquiries</li>
          </ul>
        </Block>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Information Sharing',
    content: (
      <>
        <Block title="What we do share">
          <ul>
            <li>
              <strong>Within your company:</strong> Shift information with your supervisors and colleagues as needed
              for scheduling
            </li>
            <li>
              <strong>Company directory:</strong> Company names and logos are shown in the company list employees
              choose from when requesting to join
            </li>
            <li>
              <strong>Service providers:</strong> Limited data with trusted partners who help us operate the platform
              (email services, hosting)
            </li>
            <li>
              <strong>Legal requirements:</strong> Information when required by law or to protect rights and safety
            </li>
          </ul>
        </Block>
        <Block title="What we don't share">
          <ul>
            <li>We never sell your personal information to anyone</li>
            <li>We don't share data with other companies for marketing</li>
            <li>We don't give third parties access to your account</li>
            <li>We don't share information across different companies</li>
          </ul>
        </Block>
        <p>
          <strong>Important:</strong> All service providers we work with are required to protect your information and
          can only use it for the specific services they provide to us.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Data Security',
    content: (
      <>
        <p>We take data security seriously and use industry-standard measures to protect your information:</p>
        <Block title="Technical security">
          <ul>
            <li>SSL/TLS encryption for all data transmission</li>
            <li>Secure password hashing and storage</li>
            <li>Regular security updates and patches</li>
            <li>Secure cloud hosting infrastructure</li>
          </ul>
        </Block>
        <Block title="Access controls">
          <ul>
            <li>Role-based access permissions</li>
            <li>Signed session tokens that expire automatically</li>
            <li>One-time email codes to verify new accounts and password resets</li>
            <li>Resend cooldowns and temporary lockout after repeated wrong codes</li>
          </ul>
        </Block>
        <p>
          <strong>Your role in security:</strong> Keep your login credentials secure, use a strong password, and log
          out when using shared devices. Report any suspicious activity immediately.
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Your Rights',
    content: (
      <>
        <p>You have control over your personal information. Here are your rights:</p>
        <Block title="Access your data">
          <p>
            You can request a copy of all personal information we have about you. This includes your profile data and
            your shift and day-off swap history.
          </p>
        </Block>
        <Block title="Update your information">
          <p>
            You can ask us to correct inaccurate information at any time by contacting us. Employees can reset their
            password at any time using a one-time code sent to their email.
          </p>
        </Block>
        <Block title="Delete your account">
          <p>
            You can ask us to delete your account and personal information at any time. Note that some information may
            be retained for legal compliance or operational purposes.
          </p>
        </Block>
        <Block title="Communications">
          <p>
            We only send emails related to your account and your requests — verification codes, password reset codes,
            and updates on offers and decisions. These are needed for the service to work, so they can't be switched
            off individually.
          </p>
        </Block>
        <Block title="How to exercise your rights">
          <p>
            To exercise any of these rights, simply email us at <Email />. We'll respond to your request within 30
            days.
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
        <p>Have questions about this privacy policy or how we handle your data? We're here to help.</p>
        <Block title="Privacy questions and general support">
          <p>
            Email <Email /> for privacy-related inquiries, data requests, and general questions about your account or
            our services.
          </p>
        </Block>
        <Block title="Policy updates">
          <p>We may update this privacy policy from time to time. When we do, we'll notify you by:</p>
          <ul>
            <li>Sending an email to your registered address</li>
            <li>Posting a notice on our platform</li>
            <li>Updating the "Last updated" date above</li>
          </ul>
        </Block>
        <p>
          See also our <Link to="/cookie_policy">Cookie Policy</Link> and <Link to="/terms">Terms of Service</Link>.
        </p>
      </>
    ),
  },
];

const PrivacyPolicy = () => (
  <LegalLayout
    title="Privacy Policy"
    intro="We're committed to protecting your privacy. This policy explains how we handle your information."
    lastUpdated="October 16, 2026"
    sections={sections}
  />
);

export default PrivacyPolicy;
