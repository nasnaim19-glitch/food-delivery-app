import { Link } from "react-router-dom";
import styled from "styled-components";

const Page = styled.main`
  overflow: hidden;
`;

const Hero = styled.section`
  padding: 80px 0 60px;
`;

const HeroContent = styled.div`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TextArea = styled.div`
  max-width: 650px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  margin-bottom: 20px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 700;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(3rem, 7vw, 5.5rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  color: var(--text);
`;

const Highlight = styled.span`
  color: var(--primary);
`;

const Description = styled.p`
  max-width: 580px;
  margin: 24px 0 0;
  color: var(--text-soft);
  font-size: 1.1rem;
  line-height: 1.8;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
`;

const PrimaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 22px;
  border-radius: 999px;
  background: var(--primary);
  color: white;
  text-decoration: none;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
  transition: 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 22px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: #7a4b1f;
  text-decoration: none;
  font-weight: 700;
  transition: 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Visual = styled.div`
  position: relative;
  min-height: 440px;
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 25% 25%, var(--yellow-soft), transparent 34%),
    radial-gradient(circle at 75% 35%, var(--pink-soft), transparent 32%),
    linear-gradient(145deg, #fff7ed, #ecf8f3);
  box-shadow: var(--shadow-md);

  @media (max-width: 900px) {
    min-height: 340px;
  }
`;

const FoodCircle = styled.div`
  position: absolute;
  inset: 50% auto auto 50%;
  width: 230px;
  height: 230px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: white;
  display: grid;
  place-items: center;
  font-size: 6rem;
  box-shadow: 0 20px 50px rgba(47, 47, 47, 0.12);
`;

const FloatingCard = styled.div`
  position: absolute;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow-sm);
  font-weight: 700;
`;

const CardOne = styled(FloatingCard)`
  top: 42px;
  left: 30px;
`;

const CardTwo = styled(FloatingCard)`
  right: 28px;
  bottom: 48px;
`;

const Features = styled.section`
  padding: 32px 0 80px;
`;

const FeatureGrid = styled.div`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.article`
  padding: 26px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 1.2rem;
`;

const FeatureText = styled.p`
  margin: 0;
  color: var(--text-soft);
  line-height: 1.7;
`;

function Home() {
  return (
    <Page>
      <Hero>
        <HeroContent>
          <TextArea>
            <Badge>Fresh food • Happy mood</Badge>

            <Title>
              Your next favorite meal is
              <Highlight> closer than you think.</Highlight>
            </Title>

            <Description>
              Discover colorful restaurants, explore fresh menus and find the
              dishes that match your mood.
            </Description>

            <Actions>
              <PrimaryButton to="/restaurants">
                Explore restaurants
              </PrimaryButton>

              <SecondaryButton to="/restaurants">
                Find something delicious
              </SecondaryButton>
            </Actions>
          </TextArea>

          <Visual>
            <CardOne>⭐ Top rated nearby</CardOne>
            <FoodCircle>🥗</FoodCircle>
            <CardTwo>🍕 Fresh picks today</CardTwo>
          </Visual>
        </HeroContent>
      </Hero>

      <Features>
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>🍽️</FeatureIcon>
            <FeatureTitle>Discover restaurants</FeatureTitle>
            <FeatureText>
              Browse restaurants with different styles, cities and menus.
            </FeatureText>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔎</FeatureIcon>
            <FeatureTitle>Search your way</FeatureTitle>
            <FeatureText>
              Find meals by name, category, restaurant or price.
            </FeatureText>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>💚</FeatureIcon>
            <FeatureTitle>Save your favorites</FeatureTitle>
            <FeatureText>
              Keep the restaurants you love close and come back anytime.
            </FeatureText>
          </FeatureCard>
        </FeatureGrid>
      </Features>
    </Page>
  );
}

export default Home;