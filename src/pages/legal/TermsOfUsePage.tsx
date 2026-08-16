import { LegalPage } from '../../components/layout/LegalPage'
import { SmartLink } from '../../components/ui/SmartLink'
import { legal, site } from '../../data/site'
import { pageSeo } from '../../data/seo'

/**
 * DRAFT — written to be reviewed by a lawyer before launch, not to replace one.
 * Every [bracketed] value must be filled in; they render verbatim on purpose.
 */
export function TermsOfUsePage() {
  return (
    <LegalPage
      title="Terms of use"
      seo={pageSeo.terms}
      summary="We introduce you to banks and NBFCs and help you through their process. We are not a lender, we charge you nothing, and the final decision on any loan is always the lender's."
    >
      <h2>1. Accepting these terms</h2>
      <p>
        This website is operated by {site.legalName}, CIN {legal.cin},{' '}
        {site.address}. By using the site or submitting an enquiry you agree to
        these terms. If you do not agree, please do not use the site.
      </p>

      <h2>2. What we do — and what we do not do</h2>
      <p>
        We are an independent loan distributor. We collect your requirement,
        identify lenders on our panel whose policy you are likely to fit, submit
        your application with your consent, and assist you through documentation
        until disbursal.
      </p>
      <p>
        <strong>We are not a bank, an NBFC, or a lender of any kind.</strong> We
        do not sanction loans, we do not set interest rates or fees, and we do
        not disburse or recover money. Every credit decision is made solely by
        the lender, at its discretion, under its own policy. Nothing on this
        site is an offer of credit or a guarantee of approval.
      </p>

      <h2>3. Our service is free to you</h2>
      <p>
        We do not charge borrowers. We are paid a distribution commission by the
        lender when a loan is disbursed. Lenders may separately charge you
        processing fees, documentation charges or other costs — those are the
        lender's charges, disclosed by the lender, and are not paid to us.
      </p>
      <p>
        No employee or representative of ours is authorised to ask you for a
        fee, a deposit, or any payment in exchange for arranging a loan. If
        anyone does so in our name, report it to us immediately.
      </p>

      <h2>4. Who may use this site</h2>
      <p>
        You must be at least 18 years old, resident in India, and legally
        capable of entering into a contract.
      </p>

      <h2>5. The information you give us</h2>
      <p>
        You agree that the information you submit is true, accurate and your
        own. Lenders rely on it. Submitting false or misleading information may
        result in your application being rejected and may have consequences
        under law.
      </p>
      <p>
        By submitting an enquiry you authorise us to share your details with
        lenders on our panel for the purpose of assessing your eligibility, and
        to contact you about that enquiry by phone, WhatsApp, SMS and email —
        including where your number is registered on the Do Not Disturb
        register, to the extent that consent permits.
      </p>

      <h2>6. Rates and figures shown on this site</h2>
      <p>
        Interest rates, tenures, eligibility figures and EMI calculations shown
        here are <strong>indicative only</strong>. The EMI calculator is a
        planning aid using the rate you select; it is not an offer. Actual rates
        and terms depend on the lender's assessment of your profile and may
        differ. We update indicative rates periodically but do not warrant that
        they are current at any given moment.
      </p>

      <h2>7. Dealings with lenders</h2>
      <p>
        Any loan you take is a contract between you and the lender. Its terms,
        including rates, fees, prepayment conditions and recovery practices, are
        governed by the lender's documents, which you should read before
        signing. We are not a party to that contract and are not responsible for
        the lender's conduct.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The content, design, logos and marks on this site belong to{' '}
        {site.legalName} or its licensors, except for bank and NBFC names and
        logos, which belong to their respective owners and are used to identify
        our partners. You may not copy, reproduce or reuse our content without
        written permission.
      </p>

      <h2>9. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>submit an application on behalf of someone else without authority;</li>
        <li>attempt to gain unauthorised access to the site or its systems;</li>
        <li>scrape, copy or harvest data from the site by automated means;</li>
        <li>use the site for anything unlawful or fraudulent.</li>
      </ul>

      <h2>10. Limitation of liability</h2>
      <p>
        The site is provided on an "as is" basis. To the extent permitted by
        law, we are not liable for indirect or consequential loss, for a
        lender's decision to decline or price your application, for delays
        caused by a lender, or for loss arising from inaccurate information you
        supplied. Nothing here limits liability that cannot be limited by law.
      </p>

      <h2>11. Third-party links</h2>
      <p>
        This site links to third-party services such as WhatsApp and to lender
        websites. We do not control them and are not responsible for their
        content or practices.
      </p>

      <h2>12. Changes and termination</h2>
      <p>
        We may amend these terms or discontinue any part of the site at any
        time. Continued use after a change means you accept the revised terms.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These terms are governed by the laws of India. The courts at Bengaluru,
        Karnataka have exclusive jurisdiction over any dispute. [Confirm this
        jurisdiction clause with your lawyer.]
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these terms:{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>, or{' '}
        <a href={site.phoneHref}>{site.phone}</a>. To raise a complaint, see our{' '}
        <SmartLink href="/grievance">grievance redressal</SmartLink> page. For
        how we handle your data, see our{' '}
        <SmartLink href="/privacy">privacy policy</SmartLink>.
      </p>
    </LegalPage>
  )
}
