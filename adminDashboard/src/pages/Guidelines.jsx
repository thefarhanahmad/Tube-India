import InfoPage, { Section } from "../components/InfoPage";

const Guidelines = () => (
  <InfoPage
    title="Community Guidelines"
    subtitle="Keeping Bideo safe, respectful and fun for everyone."
    updated="June 12, 2026"
  >
    <Section heading="Be respectful">
      <p>
        Treat other creators and viewers with respect. Harassment, bullying, hate speech and
        threats are not allowed on Bideo.
      </p>
    </Section>
    <Section heading="Keep it legal & original">
      <p>
        Only upload content you have the rights to share. Do not post content that infringes
        copyright, promotes illegal activity, or impersonates others.
      </p>
    </Section>
    <Section heading="No harmful or explicit content">
      <p>
        Content that is violent, sexually explicit, or that endangers minors is strictly prohibited
        and will be removed. Accounts that repeatedly violate this rule will be terminated.
      </p>
    </Section>
    <Section heading="No spam or misleading content">
      <p>
        Do not use misleading thumbnails or titles, post spam, or attempt to artificially inflate
        views, likes or rewards. This protects both creators and our monetization system.
      </p>
    </Section>
    <Section heading="Reporting">
      <p>
        If you see content that breaks these guidelines, use the in-app report button. Our team
        reviews reports and takes action to keep the community safe.
      </p>
    </Section>
  </InfoPage>
);

export default Guidelines;
