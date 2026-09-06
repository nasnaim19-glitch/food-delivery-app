import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

import ProductCard from "../components/ProductCard.jsx";

const Page = styled.main`
  padding: 48px 0 80px;
`;

const Container = styled.div`
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  align-items: center;
  margin-bottom: 48px;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;

const HeroImage = styled.img`
  width: 100%;
  height: 360px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 4rem);
  letter-spacing: -0.04em;
`;

const Description = styled.p`
  margin: 0;
  color: var(--text-soft);
  font-size: 1.05rem;
  line-height: 1.8;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Tag = styled.span`
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 700;
`;

const Rating = styled.span`
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--yellow-soft);
  color: #6a5716;
  font-size: 0.9rem;
  font-weight: 700;
`;

const Status = styled.span`
  padding: 8px 12px;
  border-radius: 999px;
  background: ${({ $isOpen }) =>
    $isOpen ? "var(--primary-soft)" : "var(--pink-soft)"};
  color: ${({ $isOpen }) => ($isOpen ? "var(--primary)" : "#9a4f45")};
  font-size: 0.9rem;
  font-weight: 700;
`;

const CategorySection = styled.section`
  margin-top: 42px;
`;

const CategoryTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 1.8rem;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Message = styled.div`
  width: min(1180px, calc(100% - 32px));
  margin: 48px auto;
  padding: 28px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-soft);
`;

function RestaurantDetails() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `http://localhost:3001/api/restaurants/${id}`
        );

        setRestaurant(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch restaurant:", err);

        if (err.response?.status === 404) {
          setError("Restaurant not found.");
        } else if (err.response?.status === 400) {
          setError("Invalid restaurant ID.");
        } else {
          setError("Could not load restaurant. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  if (loading) {
    return <Message>Loading restaurant...</Message>;
  }

  if (error) {
    return <Message>{error}</Message>;
  }

  if (!restaurant) {
    return <Message>Restaurant not found.</Message>;
  }

  return (
    <Page>
      <Container>
        <Hero>
          <HeroImage
            src={restaurant.imageUrl}
            alt={restaurant.name}
          />

          <Info>
            <Title>{restaurant.name}</Title>

            <Description>
              {restaurant.description || "Discover something delicious."}
            </Description>

            <Meta>
              {restaurant.city && <Tag>{restaurant.city}</Tag>}
              {restaurant.address && <Tag>{restaurant.address}</Tag>}
              <Rating>⭐ {restaurant.rating}</Rating>

              <Status $isOpen={restaurant.isOpen}>
                {restaurant.isOpen ? "Open now" : "Closed"}
              </Status>
            </Meta>
          </Info>
        </Hero>

        {restaurant.categories.length === 0 ? (
          <Message>No menu categories available yet.</Message>
        ) : (
          restaurant.categories.map((category) => (
            <CategorySection key={category.id}>
              <CategoryTitle>{category.name}</CategoryTitle>

              {category.products.length === 0 ? (
                <Message>No products in this category.</Message>
              ) : (
                <ProductGrid>
                  {category.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </ProductGrid>
              )}
            </CategorySection>
          ))
        )}
      </Container>
    </Page>
  );
}

export default RestaurantDetails;