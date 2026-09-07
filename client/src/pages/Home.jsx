import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styled from "styled-components";

const RECOMMENDATIONS_API_URL =
  "http://localhost:3001/api/recommendations";

function Home() {
  const [recommendations, setRecommendations] =
    useState(null);

  const [recommendationsLoading, setRecommendationsLoading] =
    useState(false);

  const [recommendationsError, setRecommendationsError] =
    useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setRecommendations(null);
        return;
      }

      try {
        setRecommendationsLoading(true);
        setRecommendationsError("");

        const response = await axios.get(
          RECOMMENDATIONS_API_URL,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRecommendations(response.data);
      } catch (error) {
        console.error(
          "Failed to load recommendations:",
          error
        );

        setRecommendationsError(
          "Could not load personalized recommendations."
        );
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <Page>
      <Hero>
        <HeroContent>
          <TextArea>
            <Badge>
              Fresh food • Happy mood
            </Badge>

            <Title>
              Your next favorite meal is
              <Highlight>
                {" "}
                closer than you think.
              </Highlight>
            </Title>

            <Description>
              Discover colorful restaurants,
              explore fresh menus and find the
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
            <CardOne>
              ⭐ Top rated nearby
            </CardOne>

            <FoodCircle>
              🥗
            </FoodCircle>

            <CardTwo>
              🍕 Fresh picks today
            </CardTwo>
          </Visual>
        </HeroContent>
      </Hero>

      {recommendationsLoading && (
        <RecommendationSection>
          <RecommendationContainer>
            <RecommendationLoading>
              Preparing your recommendations...
            </RecommendationLoading>
          </RecommendationContainer>
        </RecommendationSection>
      )}

      {!recommendationsLoading &&
        recommendationsError && (
          <RecommendationSection>
            <RecommendationContainer>
              <RecommendationMessage>
                {recommendationsError}
              </RecommendationMessage>
            </RecommendationContainer>
          </RecommendationSection>
        )}

      {!recommendationsLoading &&
        !recommendationsError &&
        recommendations && (
          <RecommendationSection>
            <RecommendationContainer>
              <RecommendationHeader>
                <div>
                  <RecommendationEyebrow>
                    🧠 Smart picks
                  </RecommendationEyebrow>

                  <RecommendationTitle>
                    Recommended for you
                  </RecommendationTitle>

                  <RecommendationSubtitle>
                    {recommendations.personalized
                      ? "Based on your orders and favorites."
                      : "Fresh picks to help you discover something delicious."}
                  </RecommendationSubtitle>
                </div>

                {recommendations.profile
                  ?.topCategory && (
                  <TasteBadge>
                    Your top category:{" "}
                    <strong>
                      {
                        recommendations.profile
                          .topCategory
                      }
                    </strong>
                  </TasteBadge>
                )}
              </RecommendationHeader>

              {recommendations
                .restaurantRecommendations
                ?.length > 0 && (
                <RecommendationBlock>
                  <BlockHeader>
                    <div>
                      <BlockEyebrow>
                        Restaurants
                      </BlockEyebrow>

                      <BlockTitle>
                        Places you may love
                      </BlockTitle>
                    </div>

                    <SeeAllLink to="/restaurants">
                      View all restaurants →
                    </SeeAllLink>
                  </BlockHeader>

                  <RestaurantGrid>
                    {recommendations.restaurantRecommendations.map(
                      (restaurant) => (
                        <RestaurantRecommendationCard
                          key={restaurant.id}
                        >
                          <RestaurantImageWrapper>
                            <RestaurantImage
                              src={
                                restaurant.imageUrl
                              }
                              alt={
                                restaurant.name
                              }
                            />

                            <ScoreBadge>
                              Match{" "}
                              {Math.round(
                                restaurant.recommendationScore
                              )}
                            </ScoreBadge>

                            {restaurant.isHappyHourActive && (
                              <HappyHourBadge>
                                🔥 Happy Hour
                              </HappyHourBadge>
                            )}
                          </RestaurantImageWrapper>

                          <RestaurantContent>
                            <RestaurantTopRow>
                              <RestaurantName>
                                {
                                  restaurant.name
                                }
                              </RestaurantName>

                              <Rating>
                                ⭐{" "}
                                {
                                  restaurant.rating
                                }
                              </Rating>
                            </RestaurantTopRow>

                            <RestaurantReason>
                              ✨{" "}
                              {
                                restaurant.reason
                              }
                            </RestaurantReason>

                            {restaurant.city && (
                              <MetaText>
                                📍{" "}
                                {
                                  restaurant.city
                                }
                              </MetaText>
                            )}

                            {restaurant.previousOrders >
                              0 && (
                              <MetaText>
                                You ordered here{" "}
                                {
                                  restaurant.previousOrders
                                }{" "}
                                {restaurant.previousOrders ===
                                1
                                  ? "time"
                                  : "times"}
                              </MetaText>
                            )}

                            <RestaurantButton
                              to={`/restaurants/${restaurant.id}`}
                            >
                              View menu
                            </RestaurantButton>
                          </RestaurantContent>
                        </RestaurantRecommendationCard>
                      )
                    )}
                  </RestaurantGrid>
                </RecommendationBlock>
              )}

              {recommendations
                .productRecommendations
                ?.length > 0 && (
                <RecommendationBlock>
                  <BlockHeader>
                    <div>
                      <BlockEyebrow>
                        Dishes
                      </BlockEyebrow>

                      <BlockTitle>
                        Picks based on your taste
                      </BlockTitle>
                    </div>
                  </BlockHeader>

                  <ProductGrid>
                    {recommendations.productRecommendations.map(
                      (product) => (
                        <ProductRecommendationCard
                          key={product.id}
                        >
                          <ProductImageWrapper>
                            <ProductImage
                              src={
                                product.imageUrl
                              }
                              alt={
                                product.name
                              }
                            />

                            <CategoryBadge>
                              {
                                product.category
                              }
                            </CategoryBadge>
                          </ProductImageWrapper>

                          <ProductContent>
                            <ProductRestaurant>
                              {
                                product.restaurant
                                  .name
                              }
                            </ProductRestaurant>

                            <ProductName>
                              {
                                product.name
                              }
                            </ProductName>

                            <ProductReason>
                              ✨{" "}
                              {
                                product.reason
                              }
                            </ProductReason>

                            <PriceArea>
                              {product.isHappyHourPrice ? (
                                <>
                                  <OriginalPrice>
                                    ₪
                                    {Number(
                                      product.originalPrice
                                    ).toFixed(
                                      2
                                    )}
                                  </OriginalPrice>

                                  <CurrentPrice>
                                    ₪
                                    {Number(
                                      product.effectivePrice
                                    ).toFixed(
                                      2
                                    )}
                                  </CurrentPrice>

                                  <DiscountBadge>
                                    {
                                      product.discountPercent
                                    }
                                    % OFF
                                  </DiscountBadge>
                                </>
                              ) : (
                                <CurrentPrice>
                                  ₪
                                  {Number(
                                    product.effectivePrice
                                  ).toFixed(
                                    2
                                  )}
                                </CurrentPrice>
                              )}
                            </PriceArea>

                            <ProductButton
                              to={`/restaurants/${product.restaurant.id}`}
                            >
                              View at restaurant
                            </ProductButton>
                          </ProductContent>
                        </ProductRecommendationCard>
                      )
                    )}
                  </ProductGrid>
                </RecommendationBlock>
              )}
            </RecommendationContainer>
          </RecommendationSection>
        )}

      <Features>
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>
              🍽️
            </FeatureIcon>

            <FeatureTitle>
              Discover restaurants
            </FeatureTitle>

            <FeatureText>
              Browse restaurants with different
              styles, cities and menus.
            </FeatureText>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              🔎
            </FeatureIcon>

            <FeatureTitle>
              Search your way
            </FeatureTitle>

            <FeatureText>
              Find meals by name, category,
              restaurant or price.
            </FeatureText>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              💚
            </FeatureIcon>

            <FeatureTitle>
              Save your favorites
            </FeatureTitle>

            <FeatureText>
              Keep the restaurants you love close
              and come back anytime.
            </FeatureText>
          </FeatureCard>
        </FeatureGrid>
      </Features>
    </Page>
  );
}

export default Home;

const Page = styled.main`
  overflow: hidden;
`;

const Hero = styled.section`
  padding: 80px 0 60px;
`;

const HeroContent = styled.div`
  width: min(
    1180px,
    calc(100% - 32px)
  );
  margin: 0 auto;
  display: grid;
  grid-template-columns:
    1.1fr 0.9fr;
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
  font-size: clamp(
    3rem,
    7vw,
    5.5rem
  );
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
    radial-gradient(
      circle at 25% 25%,
      var(--yellow-soft),
      transparent 34%
    ),
    radial-gradient(
      circle at 75% 35%,
      var(--pink-soft),
      transparent 32%
    ),
    linear-gradient(
      145deg,
      #fff7ed,
      #ecf8f3
    );
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
  transform:
    translate(-50%, -50%);
  border-radius: 50%;
  background: white;
  display: grid;
  place-items: center;
  font-size: 6rem;
  box-shadow:
    0 20px 50px
    rgba(47, 47, 47, 0.12);
`;

const FloatingCard = styled.div`
  position: absolute;
  padding: 14px 18px;
  background:
    rgba(255, 255, 255, 0.94);
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

const RecommendationSection = styled.section`
  padding: 20px 0 70px;
`;

const RecommendationContainer = styled.div`
  width: min(
    1180px,
    calc(100% - 32px)
  );
  margin: 0 auto;
`;

const RecommendationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 30px;

  @media (max-width: 700px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const RecommendationEyebrow = styled.span`
  color: #ff6b57;
  font-size: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const RecommendationTitle = styled.h2`
  margin: 8px 0 0;
  font-size: clamp(
    2rem,
    4vw,
    3.2rem
  );
  letter-spacing: -0.04em;
`;

const RecommendationSubtitle = styled.p`
  margin: 10px 0 0;
  color: var(--text-soft);
`;

const TasteBadge = styled.div`
  padding: 11px 15px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 0.86rem;
`;

const RecommendationBlock = styled.div`
  margin-top: 34px;
`;

const BlockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 18px;

  @media (max-width: 600px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const BlockEyebrow = styled.span`
  color: var(--text-soft);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const BlockTitle = styled.h3`
  margin: 5px 0 0;
  font-size: 1.45rem;
`;

const SeeAllLink = styled(Link)`
  color: var(--primary);
  text-decoration: none;
  font-weight: 800;
`;

const RestaurantGrid = styled.div`
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 950px) {
    grid-template-columns:
      repeat(2, 1fr);
  }

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

const RestaurantRecommendationCard = styled.article`
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
`;

const RestaurantImageWrapper = styled.div`
  position: relative;
  height: 180px;
  overflow: hidden;
`;

const RestaurantImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ScoreBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 7px 10px;
  border-radius: 999px;
  background:
    rgba(255, 255, 255, 0.94);
  color: var(--primary);
  font-size: 0.76rem;
  font-weight: 900;
`;

const HappyHourBadge = styled.span`
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 7px 10px;
  border-radius: 999px;
  background:
    rgba(255, 107, 87, 0.94);
  color: white;
  font-size: 0.76rem;
  font-weight: 900;
`;

const RestaurantContent = styled.div`
  padding: 18px;
`;

const RestaurantTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
`;

const RestaurantName = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const Rating = styled.span`
  flex-shrink: 0;
  padding: 5px 8px;
  border-radius: 999px;
  background: var(--yellow-soft);
  color: #6a5716;
  font-size: 0.82rem;
  font-weight: 800;
`;

const RestaurantReason = styled.p`
  margin: 12px 0 0;
  color: #9a4f2d;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.5;
`;

const MetaText = styled.p`
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 0.84rem;
`;

const RestaurantButton = styled(Link)`
  display: inline-flex;
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  text-decoration: none;
  font-weight: 800;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 950px) {
    grid-template-columns:
      repeat(2, 1fr);
  }

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

const ProductRecommendationCard = styled.article`
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
`;

const ProductImageWrapper = styled.div`
  position: relative;
  height: 170px;
  overflow: hidden;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CategoryBadge = styled.span`
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 6px 9px;
  border-radius: 999px;
  background:
    rgba(255, 255, 255, 0.94);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 900;
`;

const ProductContent = styled.div`
  padding: 17px;
`;

const ProductRestaurant = styled.div`
  color: var(--text-soft);
  font-size: 0.8rem;
  font-weight: 700;
`;

const ProductName = styled.h3`
  margin: 5px 0 0;
  font-size: 1.1rem;
`;

const ProductReason = styled.p`
  margin: 10px 0 0;
  color: #9a4f2d;
  font-size: 0.85rem;
  font-weight: 800;
  line-height: 1.45;
`;

const PriceArea = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;

const OriginalPrice = styled.span`
  color: var(--text-soft);
  font-size: 0.82rem;
  text-decoration: line-through;
`;

const CurrentPrice = styled.strong`
  color: var(--primary);
  font-size: 1.05rem;
`;

const DiscountBadge = styled.span`
  padding: 5px 8px;
  border-radius: 999px;
  background: #fff2c8;
  color: #856317;
  font-size: 0.72rem;
  font-weight: 900;
`;

const ProductButton = styled(Link)`
  display: inline-flex;
  margin-top: 15px;
  padding: 9px 13px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: #7a4b1f;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 800;
`;

const RecommendationLoading = styled.div`
  padding: 26px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-soft);
`;

const RecommendationMessage = styled(
  RecommendationLoading
)``;

const Features = styled.section`
  padding: 32px 0 80px;
`;

const FeatureGrid = styled.div`
  width: min(
    1180px,
    calc(100% - 32px)
  );
  margin: 0 auto;
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
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