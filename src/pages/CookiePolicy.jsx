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

const Code = ({ children }) => (
  <code className="whitespace-nowrap rounded-md bg-sand-200 px-1.5 py-0.5 font-mono text-[0.86em] text-ink">{children}</code>
);

const SIGN_IN_COOKIES = [
  { prefix: 'company', who: 'a company signs in' },
  { prefix: 'employee', who: 'an Expert or SME employee signs in' },
  { prefix: 'supervisor', who: 'a supervisor signs in' },
  { prefix: 'moderator', who: 'a moderator signs in' },
];

const sections = [
  {
    id: 'overview',
    title: 'What Are Cookies?',
    content: (
      <>
        <p>
          Cookies are small text files stored on your device when you visit websites. They help websites remember your
          preferences, keep you logged in, and provide personalized experiences.
        </p>
        <Block title="Why Shiftswaper uses cookies">
          <ul>
            <li>Keep you securely logged in to your account</li>
            <li>Provide security and prevent unauthorized access</li>
          </ul>
          <p>We don't use cookies for analytics, advertising, or tracking you across other websites.</p>
        </Block>
        <Block title="Session cookies">
          <p>Temporary cookies that disappear when you close your browser.</p>
        </Block>
        <Block title="Persistent cookies">
          <p>
            Stored on your device for a specific period. Shiftswaper's sign-in cookies are persistent: they last 7 days
            so you stay signed in between visits, unless you sign out first.
          </p>
        </Block>
        <p>
          <strong>Your control:</strong> You can view and delete cookies at any time through your browser settings (see{' '}
          <a href="#management">Managing Cookies</a>).
        </p>
      </>
    ),
  },
  {
    id: 'types',
    title: 'Cookie Types',
    content: (
      <>
        <p>Shiftswaper only uses essential cookies. Here's what they are and what they do:</p>
        <Block title="Essential cookies (required)">
          <p>Required for basic website functionality and security — specifically, keeping you signed in.</p>
          <ul>
            {SIGN_IN_COOKIES.map((c) => (
              <li key={c.prefix}>
                <Code>{`${c.prefix}_token`}</Code> and <Code>{`${c.prefix}_data`}</Code> — set when {c.who}
              </li>
            ))}
          </ul>
          <p>
            Each <Code>*_token</Code> cookie holds a signed session token that identifies you to our server. Each{' '}
            <Code>*_data</Code> cookie holds basic profile details — such as your name, email address, position and
            company name — so the app can display them. These cookies are marked Secure (sent over HTTPS only) and
            SameSite=Strict (not sent with requests that come from other websites).
          </p>
          <p>
            <strong>Storage duration:</strong> 7 days, or until you sign out — whichever comes first.
          </p>
        </Block>
        <Block title="Cookies we don't use">
          <ul>
            <li>Functional or preference cookies</li>
            <li>Analytics cookies</li>
            <li>Marketing or advertising cookies</li>
          </ul>
        </Block>
        <Block title="Similar technologies">
          <p>
            While you request to join a company, we keep your email address and request ID in your browser's session
            storage so the email verification step can find them. This is cleared once verification is complete, or
            when you close the tab.
          </p>
        </Block>
      </>
    ),
  },
  {
    id: 'usage',
    title: 'How We Use Cookies',
    content: (
      <>
        <p>Here's exactly how cookies help us provide you with the best Shiftswaper experience:</p>
        <Block title="Security & authentication">
          <ul>
            <li>Keep you logged in securely across sessions</li>
            <li>Verify your identity for sensitive actions</li>
            <li>Protect against unauthorized access attempts</li>
          </ul>
        </Block>
        <Block title="Platform functionality">
          <ul>
            <li>Enable smooth page navigation</li>
            <li>Facilitate shift swap workflows</li>
            <li>Maintain form data during sessions</li>
          </ul>
        </Block>
        <p>We don't use cookies for personalization, analytics, or advertising.</p>
        <Block title="Data processing">
          <p>
            All cookie data is processed in accordance with our <Link to="/privacy">Privacy Policy</Link>. We use
            industry-standard security measures to protect cookie information, and we never sell cookie data to third
            parties.
          </p>
        </Block>
      </>
    ),
  },
  {
    id: 'third-party',
    title: 'Third-Party Cookies',
    content: (
      <>
        <p>
          Shiftswaper doesn't set any third-party cookies, and we don't use third-party analytics, advertising, or
          tracking services. The only third-party service our pages load is described below.
        </p>
        <Block title="Google Fonts">
          <p>
            Our pages load the Aleo and Rethink Sans typefaces from Google's servers (
            <Code>fonts.googleapis.com</Code> and <Code>fonts.gstatic.com</Code>). When your browser downloads these
            fonts, Google may receive your IP address and standard browser information, as with any web request.
          </p>
          <ul>
            <li>
              <strong>Purpose:</strong> Displaying the site's typefaces
            </li>
            <li>
              <strong>Data:</strong> IP address and standard request information, received by Google
            </li>
            <li>
              <strong>Control:</strong> You can block these requests with your browser or a content blocker; the site
              will fall back to your device's fonts
            </li>
          </ul>
        </Block>
        <p>
          <strong>Third-party privacy:</strong> Google's handling of this data is governed by the{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google Privacy Policy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'management',
    title: 'Managing Cookies',
    content: (
      <>
        <p>You have full control over cookies. Here are the different ways to manage them:</p>
        <Block title="Browser settings">
          <p>Control cookies through your browser's privacy settings:</p>
          <ul>
            <li>Block all cookies</li>
            <li>Block third-party cookies only</li>
            <li>Delete existing cookies</li>
            <li>Get notifications when cookies are set</li>
          </ul>
        </Block>
        <Block title="Signing out">
          <p>Signing out of Shiftswaper removes all of its sign-in cookies from your browser.</p>
        </Block>
        <Block title="Browser-specific instructions">
          <ul>
            <li>
              <strong>Chrome:</strong> Settings → Privacy → Cookies
            </li>
            <li>
              <strong>Firefox:</strong> Options → Privacy → Cookies
            </li>
            <li>
              <strong>Safari:</strong> Preferences → Privacy → Cookies
            </li>
          </ul>
        </Block>
        <p>
          <strong>Important note:</strong> Disabling essential cookies may prevent core features of Shiftswaper from
          working properly, including login, security, and basic functionality.
        </p>
      </>
    ),
  },
  {
    id: 'preferences',
    title: 'Your Preferences',
    content: (
      <>
        <p>
          Because Shiftswaper only uses essential cookies, there are no optional cookies to turn on or off, so we don't
          show a cookie preference panel. If we introduce optional cookies in the future, we'll update this policy and
          give you a way to choose.
        </p>
        <Block title="Preference summary">
          <ul>
            <li>
              <strong>Essential:</strong> Always on — required to sign in
            </li>
            <li>
              <strong>Functional:</strong> Not used
            </li>
            <li>
              <strong>Analytics:</strong> Not used
            </li>
            <li>
              <strong>Marketing:</strong> Not used
            </li>
          </ul>
        </Block>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: (
      <>
        <p>Have questions about our cookie policy or need help managing cookies? We're here to help.</p>
        <Block title="Cookie, privacy and technical questions">
          <p>
            Email <Email /> with questions about cookies, data processing, and privacy practices, or for help with
            browser issues and platform functionality.
          </p>
        </Block>
        <Block title="Policy updates">
          <p>
            We may update this cookie policy from time to time to reflect changes in our practices or legal
            requirements. When we do:
          </p>
          <ul>
            <li>We'll update the "Last updated" date at the top</li>
            <li>Major changes will be communicated via email</li>
            <li>You'll have the opportunity to review new cookie preferences</li>
            <li>Continued use of our platform constitutes acceptance of updates</li>
          </ul>
        </Block>
        <Block title="Transparency commitment">
          <p>
            We believe in complete transparency about how we use cookies and handle your data. This policy is designed
            to be clear and comprehensive, and it's updated to reflect our current practices.
          </p>
        </Block>
      </>
    ),
  },
];

const CookiePolicy = () => (
  <LegalLayout
    title="Cookie Policy"
    intro="Learn about how we use cookies to improve your Shiftswaper experience and protect your privacy."
    lastUpdated="October 16, 2026"
    sections={sections}
  />
);

export default CookiePolicy;
