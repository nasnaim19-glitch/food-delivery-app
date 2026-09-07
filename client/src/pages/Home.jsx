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
            <HeroGlow />

            <MainFoodCard>
              <FoodEmoji>🍜</FoodEmoji>

              <FoodDetails>
                <SmallLabel>Fresh pick</SmallLabel>
                <FoodName>Your next favorite</FoodName>
                <FoodDescription>
                  Delicious food from restaurants you’ll love.
                </FoodDescription>

                <FoodMeta>
                  <span>⭐ 4.8</span>
                  <span>•</span>
                  <span>25–35 min</span>
                </FoodMeta>
              </FoodDetails>
            </MainFoodCard>

            <CardOne>
              <FloatingIcon>⭐</FloatingIcon>
              <div>
                <FloatingLabel>Top rated</FloatingLabel>
                <FloatingText>Great restaurants</FloatingText>
              </div>
            </CardOne>

            <CardTwo>
              <FloatingIcon>🔥</FloatingIcon>
              <div>
                <FloatingLabel>Fresh today</FloatingLabel>
                <FloatingText>Popular picks</FloatingText>
              </div>
            </CardTwo>

            <MiniCard>
              <FloatingIcon>💚</FloatingIcon>
              <div>
                <FloatingLabel>Made for you</FloatingLabel>
                <FloatingText>Smart recommendations</FloatingText>
              </div>
            </MiniCard>
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

      <HowItWorksSection>
        <HowItWorksContainer>
          <SectionHeading>
            <SectionEyebrow>Simple from start to finish</SectionEyebrow>
            <SectionTitle>How it works</SectionTitle>
            <SectionSubtitle>
              From discovering your next meal to following your order, everything
              is designed to feel quick and easy.
            </SectionSubtitle>
          </SectionHeading>

          <StepsGrid>
            <StepCard>
              <StepNumber>01</StepNumber>
              <StepIcon>🔎</StepIcon>
              <StepTitle>Find your meal</StepTitle>
              <StepText>
                Browse restaurants, search dishes and discover personalized
                recommendations made for you.
              </StepText>
            </StepCard>

            <StepCard>
              <StepNumber>02</StepNumber>
              <StepIcon>🛒</StepIcon>
              <StepTitle>Add to cart</StepTitle>
              <StepText>
                Choose your favorite dishes, adjust quantities and review your
                order before checkout.
              </StepText>
            </StepCard>

            <StepCard>
              <StepNumber>03</StepNumber>
              <StepIcon>🍽️</StepIcon>
              <StepTitle>Enjoy your order</StepTitle>
              <StepText>
                Place your order and follow its status until your food is
                delivered and ready to enjoy.
              </StepText>
            </StepCard>
          </StepsGrid>
        </HowItWorksContainer>
      </HowItWorksSection>

      <HappyHourSection>
        <HappyHourContainer>
          <HappyHourContent>
            <HappyHourEyebrow>🔥 Limited-time deals</HappyHourEyebrow>

            <HappyHourTitle>
              Catch Happy Hour before it’s gone.
            </HappyHourTitle>

            <HappyHourText>
              Selected restaurants offer special discounts during Happy Hour.
              Prices update automatically, so you can see the deal that is active
              right now.
            </HappyHourText>

            <HappyHourActions>
              <HappyHourButton to="/restaurants">
                Explore Happy Hour deals
              </HappyHourButton>

              <HappyHourNote>
                Discounts vary by restaurant and time.
              </HappyHourNote>
            </HappyHourActions>
          </HappyHourContent>

          <HappyHourVisual>
            <DealBubble>
              <DealLabel>Happy Hour</DealLabel>
              <DealDiscount>Up to 50% OFF</DealDiscount>
              <DealText>Fresh deals. Real-time prices.</DealText>
            </DealBubble>

            <DealChipOne>🍔 Burger deals</DealChipOne>
            <DealChipTwo>🍕 Pizza specials</DealChipTwo>
          </HappyHourVisual>
        </HappyHourContainer>
      </HappyHourSection>

      <Features>
        <FeatureGrid>
          <FeatureCard to="/restaurants">
            <FeatureIcon>🍽️</FeatureIcon>
            <FeatureTitle>Discover restaurants</FeatureTitle>
            <FeatureText>
              Browse restaurants with different styles, cities and menus.
            </FeatureText>
            <FeatureAction>Explore restaurants →</FeatureAction>
          </FeatureCard>

          <FeatureCard to="/restaurants">
            <FeatureIcon>🔎</FeatureIcon>
            <FeatureTitle>Search your way</FeatureTitle>
            <FeatureText>
              Find meals by name, category, restaurant or price.
            </FeatureText>
            <FeatureAction>Start searching →</FeatureAction>
          </FeatureCard>

          <FeatureCard to="/favorites">
            <FeatureIcon>💚</FeatureIcon>
            <FeatureTitle>Save your favorites</FeatureTitle>
            <FeatureText>
              Keep the restaurants you love close and come back anytime.
            </FeatureText>
            <FeatureAction>View favorites →</FeatureAction>
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
  min-height: 470px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 18% 18%, var(--yellow-soft), transparent 32%),
    radial-gradient(circle at 82% 30%, var(--pink-soft), transparent 31%),
    radial-gradient(circle at 68% 82%, var(--primary-soft), transparent 35%),
    linear-gradient(145deg, #fff9f1, #edf9f4);
  box-shadow: var(--shadow-md);

  @media (max-width: 900px) {
    min-height: 430px;
  }

  @media (max-width: 560px) {
    min-height: 500px;
  }
`;

const HeroGlow = styled.div`
  position: absolute;
  width: 270px;
  height: 270px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.58);
  filter: blur(2px);
`;

const MainFoodCard = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(290px, calc(100% - 80px));
  transform: translate(-50%, -50%) rotate(-2deg);
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 24px 55px rgba(47, 47, 47, 0.13);
  backdrop-filter: blur(12px);
  z-index: 2;
`;

const FoodEmoji = styled.div`
  display: grid;
  place-items: center;
  width: 112px;
  height: 112px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(145deg, #fff4df, #fffaf3);
  font-size: 4.6rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8);
`;

const FoodDetails = styled.div`
  text-align: center;
`;

const SmallLabel = styled.span`
  color: var(--primary);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const FoodName = styled.h3`
  margin: 7px 0 0;
  color: var(--text);
  font-size: 1.3rem;
`;

const FoodDescription = styled.p`
  margin: 8px auto 0;
  color: var(--text-soft);
  font-size: 0.86rem;
  line-height: 1.5;
`;

const FoodMeta = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  color: var(--text-soft);
  font-size: 0.78rem;
  font-weight: 800;
`;

const FloatingCard = styled.div`
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 16px;
  border: 1px solid rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
`;

const FloatingIcon = styled.span`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--primary-soft);
  font-size: 1.05rem;
`;

const FloatingLabel = styled.div`
  color: var(--text-soft);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const FloatingText = styled.div`
  margin-top: 2px;
  color: var(--text);
  font-size: 0.86rem;
  font-weight: 900;
`;

const CardOne = styled(FloatingCard)`
  top: 34px;
  left: 24px;

  @media (max-width: 560px) {
    top: 24px;
    left: 18px;
  }
`;

const CardTwo = styled(FloatingCard)`
  right: 22px;
  bottom: 38px;

  @media (max-width: 560px) {
    right: 16px;
    bottom: 28px;
  }
`;

const MiniCard = styled(FloatingCard)`
  top: 84px;
  right: 18px;

  @media (max-width: 560px) {
    top: auto;
    right: auto;
    left: 18px;
    bottom: 96px;
  }
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

const HowItWorksSection = styled.section`
  padding: 42px 0 52px;
`;

const HowItWorksContainer = styled.div`
  width: min(
    1180px,
    calc(100% - 32px)
  );
  margin: 0 auto;
`;

const SectionHeading = styled.div`
  max-width: 650px;
  margin-bottom: 28px;
`;

const SectionEyebrow = styled.span`
  color: var(--primary);
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const SectionTitle = styled.h2`
  margin: 8px 0 10px;
  color: var(--text);
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.03em;
`;

const SectionSubtitle = styled.p`
  margin: 0;
  color: var(--text-soft);
  line-height: 1.75;
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.article`
  position: relative;
  overflow: hidden;
  min-height: 230px;
  padding: 28px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
`;

const StepNumber = styled.span`
  position: absolute;
  top: 18px;
  right: 20px;
  color: var(--primary-soft);
  font-size: 2.5rem;
  font-weight: 900;
  line-height: 1;
`;

const StepIcon = styled.div`
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 20px;
  border-radius: 17px;
  background: var(--primary-soft);
  font-size: 1.55rem;
`;

const StepTitle = styled.h3`
  margin: 0 0 10px;
  color: var(--text);
  font-size: 1.2rem;
`;

const StepText = styled.p`
  margin: 0;
  color: var(--text-soft);
  line-height: 1.7;
`;

const HappyHourSection = styled.section`
  padding: 24px 0 62px;
`;

const HappyHourContainer = styled.div`
  width: min(
    1180px,
    calc(100% - 32px)
  );
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 32px;
  align-items: center;
  padding: 34px;
  border: 1px solid rgba(255, 107, 87, 0.14);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 12% 20%, rgba(255, 196, 129, 0.18), transparent 34%),
    radial-gradient(circle at 90% 70%, rgba(124, 201, 170, 0.18), transparent 36%),
    linear-gradient(135deg, #fff8f1, #fffdf9);
  box-shadow: var(--shadow-sm);

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;

const HappyHourContent = styled.div`
  max-width: 620px;
`;

const HappyHourEyebrow = styled.span`
  color: #ff6b57;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const HappyHourTitle = styled.h2`
  margin: 10px 0 14px;
  color: var(--text);
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
`;

const HappyHourText = styled.p`
  margin: 0;
  max-width: 600px;
  color: var(--text-soft);
  line-height: 1.75;
`;

const HappyHourActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
`;

const HappyHourButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 999px;
  background: #ff6b57;
  color: white;
  text-decoration: none;
  font-weight: 800;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
`;

const HappyHourNote = styled.span`
  color: var(--text-soft);
  font-size: 0.82rem;
`;

const HappyHourVisual = styled.div`
  position: relative;
  min-height: 290px;
  display: grid;
  place-items: center;

  @media (max-width: 850px) {
    min-height: 260px;
  }
`;

const DealBubble = styled.div`
  position: relative;
  z-index: 2;
  width: min(290px, calc(100% - 40px));
  padding: 30px 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 22px 45px rgba(47, 47, 47, 0.1);
`;

const DealLabel = styled.div`
  color: #ff6b57;
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const DealDiscount = styled.div`
  margin-top: 8px;
  color: var(--text);
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.03em;
`;

const DealText = styled.div`
  margin-top: 8px;
  color: var(--text-soft);
  font-size: 0.86rem;
`;

const DealChip = styled.div`
  position: absolute;
  z-index: 3;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--shadow-sm);
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 800;
`;

const DealChipOne = styled(DealChip)`
  top: 28px;
  left: 12px;
`;

const DealChipTwo = styled(DealChip)`
  right: 12px;
  bottom: 26px;
`;

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

const FeatureCard = styled(Link)`
  display: block;
  padding: 26px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary-soft);
  }
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

const FeatureAction = styled.span`
  display: inline-flex;
  margin-top: 18px;
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 800;
`;