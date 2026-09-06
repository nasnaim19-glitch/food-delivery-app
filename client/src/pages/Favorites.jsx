import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styled from "styled-components";

import RestaurantCard from "../components/RestaurantCard.jsx";

const FAVORITES_API_URL =
  "http://localhost:3001/api/favorites";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Please log in to view your favorite restaurants."
        );
        setFavorites([]);
        return;
      }

      setLoading(true);
      setError("");

      const response = await axios.get(
        FAVORITES_API_URL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFavorites(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your favorites."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteChange = (
    restaurantId,
    isFavorite
  ) => {
    if (isFavorite) {
      return;
    }

    setFavorites((currentFavorites) =>
      currentFavorites.filter(
        (favorite) =>
          favorite.restaurantId !== restaurantId
      )
    );
  };

  if (loading) {
    return (
      <Page>
        <Message>
          Loading your favorites...
        </Message>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <MessageCard>
          <Icon>❤️</Icon>

          <h2>
            My Favorites
          </h2>

          <p>{error}</p>

          <ActionLink to="/login">
            Login
          </ActionLink>
        </MessageCard>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <Eyebrow>
          Saved for later
        </Eyebrow>

        <Title>
          My Favorites
        </Title>

        <Subtitle>
          Your favorite restaurants,
          all in one place.
        </Subtitle>
      </Header>

      {favorites.length === 0 ? (
        <EmptyState>
          <Icon>♡</Icon>

          <h2>
            No favorites yet
          </h2>

          <p>
            Tap the heart on a restaurant
            you love and it will appear here.
          </p>

          <ActionLink to="/restaurants">
            Explore restaurants
          </ActionLink>
        </EmptyState>
      ) : (
        <>
          <FavoriteCount>
            {favorites.length}{" "}
            {favorites.length === 1
              ? "favorite restaurant"
              : "favorite restaurants"}
          </FavoriteCount>

          <Grid>
            {favorites.map(
              (favorite) => (
                <RestaurantCard
                  key={favorite.id}
                  restaurant={
                    favorite.restaurant
                  }
                  initiallyFavorite={true}
                  onFavoriteChange={
                    handleFavoriteChange
                  }
                />
              )
            )}
          </Grid>
        </>
      )}
    </Page>
  );
}

export default Favorites;

const Page = styled.main`
  width: min(
    1180px,
    calc(100% - 32px)
  );
  margin: 0 auto;
  padding: 56px 0 90px;
`;

const Header = styled.header`
  margin-bottom: 32px;
`;

const Eyebrow = styled.span`
  display: inline-block;
  margin-bottom: 8px;
  color: #e85656;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(
    2.4rem,
    5vw,
    4rem
  );
  letter-spacing: -0.04em;
`;

const Subtitle = styled.p`
  margin: 12px 0 0;
  color: var(--text-soft);
  max-width: 600px;
  line-height: 1.6;
`;

const FavoriteCount = styled.div`
  margin-bottom: 20px;
  color: var(--text-soft);
  font-weight: 700;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1000px) {
    grid-template-columns:
      repeat(2, 1fr);
  }

  @media (max-width: 700px) {
    grid-template-columns:
      1fr;
  }
`;

const EmptyState = styled.section`
  padding: 70px 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  text-align: center;
  box-shadow: var(--shadow-sm);

  h2 {
    margin: 14px 0 8px;
  }

  p {
    max-width: 480px;
    margin: 0 auto 26px;
    color: var(--text-soft);
    line-height: 1.7;
  }
`;

const MessageCard = styled(EmptyState)``;

const Icon = styled.div`
  font-size: 3rem;
`;

const ActionLink = styled(Link)`
  display: inline-flex;
  padding: 12px 20px;
  border-radius: 999px;
  background: var(--primary);
  color: white;
  text-decoration: none;
  font-weight: 800;
`;

const Message = styled.div`
  padding: 50px 0;
  text-align: center;
  color: var(--text-soft);
`;