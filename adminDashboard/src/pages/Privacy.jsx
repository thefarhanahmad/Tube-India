import InfoPage, { Section } from "../components/InfoPage";

const Privacy = () => (
  <InfoPage
    title="Privacy Policy"
    subtitle="How we collect, use and protect your information."
    updated="June 12, 2026"
  >
    <Section heading="1. Information We Collect">
      <p>
        We collect information you provide when you create an account (such as your name, phone
        number or email), the content you upload, and usage data such as the videos you watch and
        interact with.
      </p>
    </Section>
    <Section heading="2. How We Use Your Information">
      <p>
        We use your information to operate and improve the Service, personalize your feed,
        recommend content, keep the platform safe, and — where you opt in — power creator
        monetization and viewer rewards.
      </p>
    </Section>
    <Section heading="3. Media Storage">
      <p>
        Uploaded videos and images are stored with our media partner (Cloudinary) and delivered via
        a global CDN. Media is compressed to improve performance and reduce data usage.
      </p>
    </Section>
    <Section heading="4. Sharing Your Information">
      <p>
        We do not sell your personal information. We share data only with service providers that
        help us run Bideo, or when required by law.
      </p>
    </Section>
    <Section heading="5. Your Choices">
      <p>
        You can edit your profile, delete your content, and request deletion of your account at any
        time. Some information may be retained as required for legal or security reasons.
      </p>
    </Section>
    <Section heading="6. Security">
      <p>
        We use industry-standard measures to protect your data, including encrypted authentication
        tokens. No method of transmission is 100% secure, but we work hard to keep your data safe.
      </p>
    </Section>
    <Section heading="7. Contact">
      <p>
        For privacy questions, contact{" "}
        <a className="font-medium text-brand hover:underline" href="mailto:support@bideo.com">
          support@bideo.com
        </a>
        .
      </p>
    </Section>
  </InfoPage>
);

export default Privacy;
