import { Link } from "react-router-dom";
import styled from "styled-components";

const Page = styled.main`
  min-height: calc(100vh - 80px);
  display: grid;
  place-items: center;
  padding: 40px 20px;
`;

const Card = styled.div`
  width: min(560px, 100%);
  padding: 48px 32px;
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
`;

const Number = styled.div`
  font-size: clamp(4rem, 12vw, 7rem);
  line-height: 1;
  font-weight: 900;
  color: var(--primary);
`;

const Title = styled.h1`
  margin: 18px 0 10px;
  font-size: 2rem;
`;

const Text = styled.p`
  margin: 0;
  color: var(--text-soft);
  line-height: 1.7;
`;

const HomeButton = styled(Link)`
  display: inline-flex;
  margin-top: 26px;
  padding: 13px 20px;
  border-radius: 999px;
  background: var(--accent);
  color: #3f2f23;
  text-decoration: none;
  font-weight: 800;
  transition: 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

function ErrorPage() {
  return (
    <Page>
      <Card>
        <Number>404</Number>

        <Title>Oops, this page got lost.</Title>

        <Text>
          The page you are looking for does not exist. Let&apos;s get you back
          to something delicious.
        </Text>

        <HomeButton to="/">Back to home</HomeButton>
      </Card>
    </Page>
  );
}

export default ErrorPage;