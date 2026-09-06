import { useState } from "react";
import axios from "axios";
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
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  height: 190px;
  overflow: hidden;
  background: var(--surface-soft);
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DiscountBadge = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 7px 11px;
  border-radius: 999px;
  background: #ff6b57;
  color: white;
  font-size: 0.82rem;
  font-weight: 900;
  box-shadow: 0 6px 18px rgba(255, 107, 87, 0.28);
`;

const Content = styled.div`
  padding: 18px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
`;

const Name = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  color: var(--text);
`;

const PriceArea = styled.div`
  display: grid;
  justify-items: end;
  gap: 4px;
  flex-shrink: 0;
`;

const RegularPrice = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: #7a4b1f;
  font-weight: 800;
`;

const OriginalPrice = styled.span`
  color: var(--text-soft);
  font-size: 0.88rem;
  text-decoration: line-through;
`;

const HappyPrice = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  background: #ffe8e4;
  color: #d84f3c;
  font-weight: 900;
  font-size: 1.05rem;
`;

const Description = styled.p`
  margin: 12px 0 0;
  color: var(--text-soft);
  line-height: 1.6;
`;

const Availability = styled.span`
  display: inline-flex;
  margin-top: 16px;
  padding: 6px 10px;
  border-radius: 999px;

  background: ${({ $available }) =>
    $available ? "var(--primary-soft)" : "var(--pink-soft)"};

  color: ${({ $available }) =>
    $available ? "var(--primary)" : "#9a4f45"};

  font-size: 0.85rem;
  font-weight: 700;
`;

const HappyHourMessage = styled.div`
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff4ec;
  color: #b84f22;
  font-size: 0.9rem;
  font-weight: 800;
`;

const AddButton = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 12px 16px;
  border: 0;
  border-radius: 14px;
  background: var(--primary);
  color: white;
  font-weight: 800;
  transition: 0.2s ease;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  margin: 12px 0 0;
  font-size: 0.9rem;
  color: ${({ $error }) => ($error ? "#a64545" : "var(--primary)")};
`;

function ProductCard({ product }) {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsError(true);
        setMessage("Please log in to add items to your cart.");
        return;
      }

      setAdding(true);
      setMessage("");

      await axios.post(
        "http://localhost:3001/api/cart",
        {
          productId: product.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsError(false);
      setMessage("Added to cart");
    } catch (error) {
      setIsError(true);

      setMessage(
        error.response?.data?.message ||
          "Could not add product to cart."
      );
    } finally {
      setAdding(false);
    }
  };

  const isHappyHour =
    product.isHappyHourPrice === true;

  const originalPrice =
    product.originalPrice ?? product.price;

  const effectivePrice =
    product.effectivePrice ?? product.price;

  return (
    <Card>
      <ImageWrapper>
        <Image
          src={product.imageUrl}
          alt={product.name}
        />

        {isHappyHour && (
          <DiscountBadge>
            🔥 {product.discountPercent}% OFF
          </DiscountBadge>
        )}
      </ImageWrapper>

      <Content>
        <TopRow>
          <Name>{product.name}</Name>

          <PriceArea>
            {isHappyHour ? (
              <>
                <OriginalPrice>
                  ₪{Number(originalPrice).toFixed(2)}
                </OriginalPrice>

                <HappyPrice>
                  ₪{Number(effectivePrice).toFixed(2)}
                </HappyPrice>
              </>
            ) : (
              <RegularPrice>
                ₪{Number(product.price).toFixed(2)}
              </RegularPrice>
            )}
          </PriceArea>
        </TopRow>

        <Description>
          {product.description || "Fresh and delicious."}
        </Description>

        <Availability $available={product.isAvailable}>
          {product.isAvailable ? "Available" : "Unavailable"}
        </Availability>

        {isHappyHour && (
          <HappyHourMessage>
            🔥 Happy Hour price is active now
          </HappyHourMessage>
        )}

        <AddButton
          type="button"
          onClick={handleAddToCart}
          disabled={!product.isAvailable || adding}
        >
          {adding ? "Adding..." : "Add to cart"}
        </AddButton>

        {message && (
          <Message $error={isError}>
            {message}
          </Message>
        )}
      </Content>
    </Card>
  );
}

export default ProductCard;