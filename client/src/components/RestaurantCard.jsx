import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const happyGlow = keyframes`
  0% {
    box-shadow:
      0 0 0 2px rgba(255, 107, 87, 0.65),
      0 0 18px rgba(255, 107, 87, 0.22);
  }

  50% {
    box-shadow:
      0 0 0 5px rgba(255, 179, 71, 0.55),
      0 0 34px rgba(255, 107, 87, 0.42),
      0 0 52px rgba(247, 178, 103, 0.22);
  }

  100% {
    box-shadow:
      0 0 0 2px rgba(255, 107, 87, 0.65),
      0 0 18px rgba(255, 107, 87, 0.22);
  }
`;

const Card = styled.article`
  overflow: hidden;
  position: relative;
  background: var(--surface);
  border: ${({ $happy }) =>
    $happy
      ? "2px solid rgba(255, 107, 87, 0.85)"
      : "1px solid var(--border)"};
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  animation: ${({ $happy }) =>
      $happy ? happyGlow : "none"}
    1.7s ease-in-out infinite;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  height: 220px;
  overflow: hidden;
  background: var(--surface-soft);
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HappyHourBadge = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  display: grid;
  gap: 2px;
  padding: 10px 13px;
  border-radius: 16px;
  background: rgba(255, 107, 87, 0.96);
  color: white;
  box-shadow: 0 8px 24px rgba(255, 107, 87, 0.3);
  backdrop-filter: blur(8px);
`;

const HappyTitle = styled.strong`
  font-size: 0.9rem;
  font-weight: 900;
`;

const HappyDiscount = styled.span`
  font-size: 0.8rem;
  font-weight: 800;
`;

const Content = styled.div`
  padding: 20px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const Name = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  color: var(--text);
`;

const Rating = styled.span`
  flex-shrink: 0;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--yellow-soft);
  color: #6a5716;
  font-weight: 700;
  font-size: 0.9rem;
`;

const Description = styled.p`
  margin: 12px 0 0;
  color: var(--text-soft);
  line-height: 1.6;
`;

const DetailsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
`;

const Tag = styled.span`
  padding: 7px 11px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 700;
`;

const StatusTag = styled.span`
  padding: 7px 11px;
  border-radius: 999px;
  background: ${({ $isOpen }) =>
    $isOpen ? "var(--primary-soft)" : "var(--pink-soft)"};
  color: ${({ $isOpen }) =>
    $isOpen ? "var(--primary)" : "#9a4f45"};
  font-size: 0.85rem;
  font-weight: 700;
`;

const HappyHourInfo = styled.div`
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(255, 107, 87, 0.12),
    rgba(247, 178, 103, 0.18)
  );
  color: #9a4f2d;
  font-weight: 800;
  line-height: 1.5;
`;

const ViewButton = styled(Link)`
  display: inline-flex;
  margin-top: 20px;
  padding: 11px 16px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: #7a4b1f;
  text-decoration: none;
  font-weight: 700;
  transition: 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

function RestaurantCard({ restaurant }) {
  const isHappyHour =
    restaurant.isHappyHourActive === true;

  return (
    <Card $happy={isHappyHour}>
      <ImageWrapper>
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
        />

        {isHappyHour && (
          <HappyHourBadge>
            <HappyTitle>
              🔥 HAPPY HOUR
            </HappyTitle>

            <HappyDiscount>
              {restaurant.happyHour?.discountPercent}% OFF
            </HappyDiscount>
          </HappyHourBadge>
        )}
      </ImageWrapper>

      <Content>
        <TopRow>
          <Name>{restaurant.name}</Name>

          <Rating>
            ⭐ {restaurant.rating}
          </Rating>
        </TopRow>

        <Description>
          {restaurant.description ||
            "Discover something delicious."}
        </Description>

        <DetailsRow>
          {restaurant.city && (
            <Tag>
              {restaurant.city}
            </Tag>
          )}

          <StatusTag $isOpen={restaurant.isOpen}>
            {restaurant.isOpen
              ? "Open now"
              : "Closed"}
          </StatusTag>
        </DetailsRow>

        {isHappyHour && (
          <HappyHourInfo>
            🔥 50% OFF is active now
            <br />
            {restaurant.happyHour?.startTime}
            {" – "}
            {restaurant.happyHour?.endTime}
          </HappyHourInfo>
        )}

        <ViewButton
          to={`/restaurants/${restaurant.id}`}
        >
          View menu
        </ViewButton>
      </Content>
    </Card>
  );
}

export default RestaurantCard;