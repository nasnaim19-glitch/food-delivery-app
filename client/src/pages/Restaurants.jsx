import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styled from "styled-components";

import RestaurantCard from "../components/RestaurantCard.jsx";
import SearchBar from "../components/SearchBar.jsx";

const RESTAURANTS_API_URL =
  "http://localhost:3001/api/restaurants";

const FAVORITES_API_URL =
  "http://localhost:3001/api/favorites";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const restaurantsResponse = await axios.get(
          RESTAURANTS_API_URL
        );

        setRestaurants(restaurantsResponse.data);

        const token = localStorage.getItem("token");

        if (!token) {
          setFavoriteIds([]);
          return;
        }

        try {
          const favoritesResponse = await axios.get(
            FAVORITES_API_URL,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const ids = favoritesResponse.data.map(
            (favorite) => favorite.restaurantId
          );

          setFavoriteIds(ids);
        } catch (favoritesError) {
          console.error(
            "Failed to fetch favorites:",
            favoritesError
          );

          setFavoriteIds([]);
        }
      } catch (err) {
        console.error(
          "Failed to fetch restaurants:",
          err
        );

        setError(
          "Could not load restaurants. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFavoriteChange = (
    restaurantId,
    isFavorite
  ) => {
    setFavoriteIds((currentIds) => {
      if (isFavorite) {
        if (currentIds.includes(restaurantId)) {
          return currentIds;
        }

        return [...currentIds, restaurantId];
      }

      return currentIds.filter(
        (id) => id !== restaurantId
      );
    });
  };

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return restaurants;
    }

    return restaurants.filter((restaurant) => {
      return (
        restaurant.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        restaurant.city
          ?.toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [restaurants, search]);

  if (loading) {
    return (
      <Message>
        Loading restaurants...
      </Message>
    );
  }

  if (error) {
    return (
      <Message>
        {error}
      </Message>
    );
  }

  return (
    <Page>
      <Header>
        <Title>
          Find your next favorite restaurant
        </Title>

        <Subtitle>
          Explore fresh places, discover new flavors and
          choose what fits your mood today.
        </Subtitle>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by restaurant or city..."
        />
      </Header>

      {filteredRestaurants.length === 0 ? (
        <Message>
          No restaurants found.
        </Message>
      ) : (
        <Grid>
          {filteredRestaurants.map(
            (restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                initiallyFavorite={favoriteIds.includes(
                  restaurant.id
                )}
                onFavoriteChange={
                  handleFavoriteChange
                }
              />
            )
          )}
        </Grid>
      )}
    </Page>
  );
}

export default Restaurants;

const Page = styled.main`
  padding: 56px 0 80px;
`;

const Header = styled.div`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto 32px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 4rem);
  letter-spacing: -0.04em;
`;

const Subtitle = styled.p`
  margin: 12px 0 0;
  color: var(--text-soft);
  max-width: 650px;
`;

const Grid = styled.div`
  width: min(1180px, calc(100% - 32px));
  margin: 32px auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Message = styled.div`
  width: min(1180px, calc(100% - 32px));
  margin: 40px auto;
  padding: 28px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-soft);
`;