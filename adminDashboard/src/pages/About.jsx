import InfoPage, { Section } from "../components/InfoPage";

const About = () => (
  <InfoPage
    title="About Bideo"
    subtitle="The mobile-first video platform built for India."
  >
    <Section heading="Our mission">
      <p>
        Bideo is a community-driven video sharing platform designed for the Indian audience. We
        want every creator — no matter how big or small — to be able to share their passion,
        knowledge and entertainment, and to be rewarded for it.
      </p>
    </Section>
    <Section heading="What makes us different">
      <p>
        We’re mobile-first, fast and clean. Watching is free and open — you only sign in when you
        want to like, comment, subscribe or upload. And with creator monetization and viewer
        rewards on the way, your time on Bideo is time well spent.
      </p>
    </Section>
    <Section heading="Built for creators">
      <p>
        From long-form videos to vertical shorts and community posts, Bideo gives creators the
        tools to grow an audience and turn their content into income.
      </p>
    </Section>
  </InfoPage>
);

export default About;
