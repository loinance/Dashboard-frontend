import { LegalPage } from '../../components/layout/LegalPage'
import { SmartLink } from '../../components/ui/SmartLink'
import { legal, site } from '../../data/site'
import { pageSeo } from '../../data/seo'

/**
 * DRAFT — written to be reviewed by a lawyer before launch, not to replace one.
 * Every [bracketed] value must be filled in; they render verbatim on purpose.
 */
export function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      seo={pageSeo.privacy}
      summary={`We collect the details you give us so partner lenders can tell you whether they will fund you. We share those details only with lenders, only to process your enquiry, and we never sell them.`}
    >
      <h2>1. Who we are</h2>
      <p>
        {site.legalName} ({site.name}) is a private limited company registered
        in India, CIN {legal.cin}, with its office at {site.address}. We are an
        independent loan distributor. <strong>We are not a lender</strong> — we
        do not sanction loans, set interest rates or disburse funds.
      </p>
      <p>
        For the purposes of the Digital Personal Data Protection Act, 2023, we
        act as a <strong>Data Fiduciary</strong> for the information you submit
        through this website.
      </p>

      <h2>2. What we collect</h2>
      <p>When you use the enquiry form, WhatsApp or the phone number on this site, we collect:</p>
      <ul>
        <li>
          <strong>Identity and contact details</strong> — your name as on PAN,
          mobile number, and email address if you send us one.
        </li>
        <li>
          <strong>Financial details</strong> — the loan amount you are seeking,
          your monthly income, your employment type and the loan product you
          are interested in.
        </li>
        <li>
          <strong>Documents</strong> — where an application progresses, the KYC
          and income documents the lender requires (for example PAN, Aadhaar,
          salary slips, bank statements). We collect these only when a lender
          asks for them, and only for that application.
        </li>
        <li>
          <strong>Technical data</strong> — basic information your browser sends,
          such as IP address, device and browser type, and the pages you viewed.
        </li>
      </ul>
      <p>
        We do not ask for, and you should never send us, your net-banking
        password, card PIN, CVV, or any OTP.
      </p>

      <h2>3. Why we collect it</h2>
      <ul>
        <li>To assess which of our partner lenders are likely to approve you.</li>
        <li>To submit your application to the lenders you agree to.</li>
        <li>To contact you about your enquiry by phone, WhatsApp or email.</li>
        <li>To follow your file through to sanction and disbursal.</li>
        <li>To meet our record-keeping obligations as a distribution partner.</li>
      </ul>

      <h2>4. Consent</h2>
      <p>
        We process your information on the basis of the consent you give when
        you submit the enquiry form. That consent is specific to the purposes
        listed above.
      </p>
      <p>
        <strong>You can withdraw your consent at any time</strong> by writing to{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>. Withdrawing consent
        stops any further processing by us, but it cannot undo processing
        already carried out, and it does not affect an application a lender has
        already begun — that is governed by the lender's own terms.
      </p>

      <h2>5. Who we share it with</h2>
      <p>
        This is the part that matters most, so it is stated plainly.{' '}
        <strong>
          We share your details with banks and NBFCs on our partner panel
        </strong>{' '}
        so they can assess your eligibility. That is the service you are asking
        us to perform. The current panel is listed on our home page.
      </p>
      <p>
        Once your details reach a lender, that lender processes them under its
        own privacy policy, which we do not control. We encourage you to read
        the policy of any lender whose offer you accept.
      </p>
      <p>We also share information with:</p>
      <ul>
        <li>
          <strong>Service providers</strong> who help us operate — for example
          hosting, communications and customer-support tools — under contracts
          that limit them to our instructions.
        </li>
        <li>
          <strong>Regulators, courts and law-enforcement agencies</strong> where
          we are legally required to.
        </li>
      </ul>
      <p>
        <strong>We do not sell your personal data</strong>, and we do not share
        it with unrelated third parties for their own marketing.
      </p>

      <h2>6. How long we keep it</h2>
      <p>
        We keep enquiry data for as long as needed to serve your request and to
        satisfy our legal and audit obligations, after which it is deleted or
        anonymised. Where an application results in a disbursed loan, records
        are retained for the period required by the lender and by applicable
        law. [Confirm your retention period with your compliance advisor and
        state it here in months or years.]
      </p>

      <h2>7. How we protect it</h2>
      <p>
        We apply reasonable security practices to protect your information
        against unauthorised access, disclosure, alteration and loss, including
        access controls, encrypted transmission and restricting staff access to
        those who need it. No method of transmission or storage is completely
        secure, so we cannot guarantee absolute security.
      </p>
      <p>
        If a personal-data breach occurs, we will notify affected individuals
        and the Data Protection Board of India as required under the DPDP Act.
      </p>

      <h2>8. Your rights</h2>
      <p>Subject to applicable law, you may ask us to:</p>
      <ul>
        <li>confirm what personal data of yours we hold and how we use it;</li>
        <li>correct or complete anything inaccurate;</li>
        <li>erase data we no longer need for the purpose you gave it for;</li>
        <li>tell you who we have shared your data with;</li>
        <li>nominate someone to exercise these rights if you are unable to.</li>
      </ul>
      <p>
        Write to <a href={`mailto:${site.email}`}>{site.email}</a>. We will
        respond within {legal.resolutionDays} days. If you are not satisfied,
        see our <SmartLink href="/grievance">grievance redressal</SmartLink>{' '}
        page, and note that
        you may complain to the Data Protection Board of India.
      </p>

      <h2>9. Cookies and analytics</h2>
      <p>
        This site uses only what is necessary to make it work. [If you add
        analytics, advertising pixels or a chat widget, list them here with what
        they collect, and add a consent banner before they load.]
      </p>

      <h2>10. Children</h2>
      <p>
        Our services are for individuals aged 18 and above. We do not knowingly
        collect data from children. If you believe a child has given us personal
        data, write to us and we will delete it.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy as our services or the law change. The date at
        the top reflects the most recent version. Material changes will be
        notified on this page.
      </p>

      <h2>12. Contact us</h2>
      <dl>
        <dt>Entity</dt>
        <dd>{site.legalName}</dd>
        <dt>Grievance Officer</dt>
        <dd>
          {legal.grievanceOfficer.name}, {legal.grievanceOfficer.designation}
        </dd>
        <dt>Email</dt>
        <dd>
          <a href={`mailto:${legal.grievanceOfficer.email}`}>
            {legal.grievanceOfficer.email}
          </a>
        </dd>
        <dt>Phone</dt>
        <dd>
          <a href={site.phoneHref}>{legal.grievanceOfficer.phone}</a>
        </dd>
        <dt>Address</dt>
        <dd>{site.address}</dd>
      </dl>
    </LegalPage>
  )
}
