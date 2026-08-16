import { LegalPage } from '../../components/layout/LegalPage'
import { legal, site } from '../../data/site'
import { pageSeo } from '../../data/seo'

/**
 * DRAFT — written to be reviewed by a lawyer before launch, not to replace one.
 * Every [bracketed] value must be filled in; they render verbatim on purpose.
 */
export function GrievancePage() {
  return (
    <LegalPage
      title="Grievance redressal"
      seo={pageSeo.grievance}
      summary={`If something has gone wrong, tell us. We acknowledge every complaint within ${legal.acknowledgementHours} hours and aim to resolve it within ${legal.resolutionDays} days. If we do not, you have a route above us — it is set out below.`}
    >
      <h2>Level 1 — Talk to us first</h2>
      <p>
        Most issues are settled at this stage. Call{' '}
        <a href={site.phoneHref}>{site.phone}</a>, message us on{' '}
        <a href={site.whatsapp} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        , or email <a href={`mailto:${site.email}`}>{site.email}</a>, between{' '}
        {site.hours}.
      </p>

      <h3>What to include</h3>
      <ul>
        <li>your name and registered mobile number;</li>
        <li>your application or reference number, if you have one;</li>
        <li>the lender involved, if the complaint concerns an application;</li>
        <li>what happened, with dates;</li>
        <li>what outcome you are asking for.</li>
      </ul>
      <p>
        You will receive an acknowledgement with a complaint reference within{' '}
        {legal.acknowledgementHours} hours.
      </p>

      <h2>Level 2 — Our Grievance Officer</h2>
      <p>
        If you are not satisfied with the response, or you have not heard back
        within {legal.acknowledgementHours} hours, escalate to our Grievance
        Officer, who is responsible for complaints under the Information
        Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.
      </p>
      <dl>
        <dt>Name</dt>
        <dd>{legal.grievanceOfficer.name}</dd>
        <dt>Designation</dt>
        <dd>{legal.grievanceOfficer.designation}</dd>
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
        <dd>
          {site.legalName}, {site.address}
        </dd>
      </dl>
      <p>
        The Grievance Officer will respond within {legal.resolutionDays} days of
        receiving your complaint.
      </p>

      <h2>Level 3 — The lender</h2>
      <p>
        We are a distributor, not a lender. If your complaint is about a
        sanctioned loan — its interest rate, charges, statements, prepayment,
        collections or recovery conduct — it must be raised with the lender that
        holds the loan, through their own grievance channel. Their nodal officer
        details are on their website and in your loan documents. Tell us as
        well, and we will help you follow it up.
      </p>

      <h2>Level 4 — The regulator</h2>
      <p>
        If your complaint concerns a bank or NBFC and is not resolved within{' '}
        {legal.resolutionDays} days of being raised with them, or you are not
        satisfied with their reply, you may approach the{' '}
        <strong>RBI Ombudsman</strong> under the Reserve Bank — Integrated
        Ombudsman Scheme, 2021.
      </p>
      <ul>
        <li>
          Online:{' '}
          <a href="https://cms.rbi.org.in" target="_blank" rel="noreferrer">
            cms.rbi.org.in
          </a>
        </li>
        <li>Toll-free: 14448</li>
        <li>
          By post: Centralised Receipt and Processing Centre, Reserve Bank of
          India, 4th Floor, Sector 17, Chandigarh 160017
        </li>
      </ul>
      <p>
        For complaints about how your personal data has been handled, you may
        also approach the <strong>Data Protection Board of India</strong> under
        the Digital Personal Data Protection Act, 2023, after exhausting the
        route at Level 2.
      </p>

      <h2>A note on fraud</h2>
      <p>
        We never ask for a fee to arrange a loan, and we never ask for an OTP,
        card PIN, CVV or net-banking password. If someone contacts you in our
        name and asks for any of these, do not pay and do not share. Report it
        to us at <a href={`mailto:${site.email}`}>{site.email}</a> immediately.
      </p>
    </LegalPage>
  )
}
