import { Link } from "react-router-dom";
import styled from "styled-components";

const Card = styled.article`
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
`;

const ImageWrapper = styled.div`
  height: 220px;
  overflow: hidden;
  background: var(--surface-soft);
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  color: ${({ $isOpen }) => ($isOpen ? "var(--primary)" : "#9a4f45")};
  font-size: 0.85rem;
  font-weight: 700;
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
  return (
    <Card>
      <ImageWrapper>
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
        />
      </ImageWrapper>

      <Content>
        <TopRow>
          <Name>{restaurant.name}</Name>
          <Rating>⭐ {restaurant.rating}</Rating>
        </TopRow>

        <Description>
          {restaurant.description || "Discover something delicious."}
        </Description>

        <DetailsRow>
          {restaurant.city && <Tag>{restaurant.city}</Tag>}

          <StatusTag $isOpen={restaurant.isOpen}>
            {restaurant.isOpen ? "Open now" : "Closed"}
          </StatusTag>
        </DetailsRow>

        <ViewButton to={`/restaurants/${restaurant.id}`}>
          View menu
        </ViewButton>
      </Content>
    </Card>
  );
}

export default RestaurantCard;