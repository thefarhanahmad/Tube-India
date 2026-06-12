import InfoPage, { Section } from "../components/InfoPage";

const Terms = () => (
  <InfoPage
    title="Terms & Conditions"
    subtitle="The rules for using the Bideo platform."
    updated="June 12, 2026"
  >
    <Section heading="1. Acceptance of Terms">
      <p>
        By accessing or using Bideo (the “Service”), you agree to be bound by these Terms &
        Conditions. If you do not agree to these terms, please do not use our Service.
      </p>
    </Section>
    <Section heading="2. Your Account">
      <p>
        You are responsible for keeping your account credentials secure and for all activity that
        happens under your account. You must be at least 13 years old to create an account.
      </p>
    </Section>
    <Section heading="3. Your Content">
      <p>
        You retain ownership of the content you upload. By posting content, you grant Bideo a
        worldwide, non-exclusive, royalty-free licence to host, store, reproduce and distribute it
        for the purpose of operating and promoting the Service.
      </p>
      <p>
        You are solely responsible for your content and must have all rights necessary to share it.
      </p>
    </Section>
    <Section heading="4. Acceptable Use">
      <p>
        You agree not to upload content that is illegal, harmful, hateful, infringing, or that
        violates our Community Guidelines. We may remove content and suspend accounts that break
        these rules.
      </p>
    </Section>
    <Section heading="5. Monetization & Earnings">
      <p>
        Creator monetization and viewer rewards are offered at Bideo’s discretion and may change.
        Eligibility, payout thresholds and the payment gateway will be governed by additional terms
        published when these features launch.
      </p>
    </Section>
    <Section heading="6. Termination">
      <p>
        We may suspend or terminate your access at any time if you violate these terms or engage in
        conduct that is harmful to other users or the Service.
      </p>
    </Section>
    <Section heading="7. Changes to These Terms">
      <p>
        We may update these terms from time to time. Continued use of the Service after changes take
        effect constitutes acceptance of the revised terms.
      </p>
    </Section>
    <Section heading="8. Contact">
      <p>
        Questions about these terms? Email us at{" "}
        <a className="font-medium text-brand hover:underline" href="mailto:support@bideo.com">
          support@bideo.com
        </a>
        .
      </p>
    </Section>
  </InfoPage>
);

export default Terms;
