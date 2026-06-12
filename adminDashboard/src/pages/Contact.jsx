import InfoPage, { Section } from "../components/InfoPage";

const Contact = () => (
  <InfoPage title="Contact Us" subtitle="We'd love to hear from you.">
    <Section heading="Support">
      <p>
        Need help with your account, an upload, or anything else? Email our support team and we’ll
        get back to you as soon as we can.
      </p>
      <p>
        <a className="font-semibold text-brand hover:underline" href="mailto:support@bideo.com">
          support@bideo.com
        </a>
      </p>
    </Section>
    <Section heading="Business & creators">
      <p>
        For partnerships, brand deals or creator program enquiries, reach out at{" "}
        <a className="font-semibold text-brand hover:underline" href="mailto:partners@bideo.com">
          partners@bideo.com
        </a>
        .
      </p>
    </Section>
    <Section heading="Feedback">
      <p>
        Have an idea to make Bideo better? We read every message — tell us what you’d love to see
        next.
      </p>
    </Section>
  </InfoPage>
);

export default Contact;
