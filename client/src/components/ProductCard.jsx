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
  height: 190px;
  overflow: hidden;
  background: var(--surface-soft);
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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

const Price = styled.span`
  flex-shrink: 0;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: #7a4b1f;
  font-weight: 800;
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

  return (
    <Card>
      <ImageWrapper>
        <Image
          src={product.imageUrl}
          alt={product.name}
        />
      </ImageWrapper>

      <Content>
        <TopRow>
          <Name>{product.name}</Name>
          <Price>₪{product.price}</Price>
        </TopRow>

        <Description>
          {product.description || "Fresh and delicious."}
        </Description>

        <Availability $available={product.isAvailable}>
          {product.isAvailable ? "Available" : "Unavailable"}
        </Availability>

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