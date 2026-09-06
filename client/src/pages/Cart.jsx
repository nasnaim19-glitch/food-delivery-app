import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api/cart";
const ORDERS_API_URL = "http://localhost:3001/api/orders";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your cart.");
          return;
        }

        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCart(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load your cart."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        return;
      }

      const token = localStorage.getItem("token");

      setUpdatingItemId(itemId);
      setError("");

      const response = await axios.patch(
        `${API_URL}/${itemId}`,
        {
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(response.data.cart);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update cart item."
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");

      setUpdatingItemId(itemId);
      setError("");

      const response = await axios.delete(
        `${API_URL}/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(response.data.cart);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to remove cart item."
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in before placing an order.");
        return;
      }

      if (!cart?.items?.length) {
        setError("Your cart is empty.");
        return;
      }

      setCheckingOut(true);
      setError("");

      const response = await axios.post(
        ORDERS_API_URL,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newOrderId = response.data.order.id;

      navigate(`/orders/${newOrderId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to place your order."
      );
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <Message>Loading cart...</Message>
      </Page>
    );
  }

  if (error && !cart) {
    return (
      <Page>
        <Message>{error}</Message>

        <HomeLink to="/">
          Back to home
        </HomeLink>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <div>
          <Eyebrow>Your order</Eyebrow>

          <h1>Shopping Cart</h1>

          <p>
            Review your delicious picks before checkout.
          </p>
        </div>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {!cart?.items?.length ? (
        <EmptyCart>
          <span>🛒</span>

          <h2>Your cart is empty</h2>

          <p>
            Explore our restaurants and add something delicious.
          </p>

          <BrowseLink to="/restaurants">
            Browse restaurants
          </BrowseLink>
        </EmptyCart>
      ) : (
        <CartLayout>
          <Items>
            {cart.items.map((item) => {
              const isUpdating =
                updatingItemId === item.id;

              return (
                <CartItem key={item.id}>
                  <ProductImage
                    src={item.product.imageUrl}
                    alt={item.product.name}
                  />

                  <ProductInfo>
                    <h3>
                      {item.product.name}
                    </h3>

                    <p>
                      {item.product.description}
                    </p>

                    <ControlsRow>
                      <QuantityControls>
                        <QuantityButton
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            item.quantity <= 1 ||
                            isUpdating ||
                            checkingOut
                          }
                        >
                          −
                        </QuantityButton>

                        <Quantity>
                          {item.quantity}
                        </Quantity>

                        <QuantityButton
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            isUpdating ||
                            checkingOut
                          }
                        >
                          +
                        </QuantityButton>
                      </QuantityControls>

                      <Price>
                        ₪
                        {(
                          item.product.price *
                          item.quantity
                        ).toFixed(2)}
                      </Price>
                    </ControlsRow>

                    <RemoveButton
                      type="button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                      disabled={
                        isUpdating ||
                        checkingOut
                      }
                    >
                      {isUpdating
                        ? "Updating..."
                        : "Remove"}
                    </RemoveButton>
                  </ProductInfo>
                </CartItem>
              );
            })}
          </Items>

          <Summary>
            <h2>Order summary</h2>

            <SummaryRow>
              <span>Items</span>

              <span>
                {cart.items.reduce(
                  (sum, item) =>
                    sum + item.quantity,
                  0
                )}
              </span>
            </SummaryRow>

            <Divider />

            <TotalRow>
              <span>Total</span>

              <strong>
                ₪{Number(cart.total).toFixed(2)}
              </strong>
            </TotalRow>

            <CheckoutButton
              type="button"
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut
                ? "Placing order..."
                : "Continue to checkout"}
            </CheckoutButton>
          </Summary>
        </CartLayout>
      )}
    </Page>
  );
}

export default Cart;

const Page = styled.main`
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 56px 0 90px;
`;

const Header = styled.header`
  margin-bottom: 36px;

  h1 {
    margin: 6px 0 8px;
    font-size: clamp(2rem, 5vw, 3.4rem);
  }

  p {
    color: #6f6b78;
  }
`;

const Eyebrow = styled.span`
  color: #ff6b57;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 30px;
  align-items: start;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;

const Items = styled.div`
  display: grid;
  gap: 18px;
`;

const CartItem = styled.article`
  display: flex;
  gap: 20px;
  padding: 18px;
  background: white;
  border: 1px solid #eee9e5;
  border-radius: 22px;
  box-shadow: 0 12px 35px rgba(37, 29, 25, 0.06);

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const ProductImage = styled.img`
  width: 130px;
  height: 110px;
  object-fit: cover;
  border-radius: 16px;

  @media (max-width: 600px) {
    width: 100%;
    height: 190px;
  }
`;

const ProductInfo = styled.div`
  flex: 1;

  h3 {
    margin: 4px 0 8px;
  }

  p {
    margin: 0;
    color: #77717c;
    line-height: 1.6;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 18px;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--primary-soft);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Quantity = styled.span`
  min-width: 28px;
  text-align: center;
  font-weight: 800;
`;

const Price = styled.strong`
  color: #ff6b57;
  font-size: 1.05rem;
`;

const RemoveButton = styled.button`
  margin-top: 16px;
  padding: 9px 14px;
  border: none;
  border-radius: 12px;
  background: var(--pink-soft);
  color: #9a4f45;
  font-weight: 800;
  cursor: pointer;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Summary = styled.aside`
  background: white;
  border: 1px solid #eee9e5;
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 12px 35px rgba(37, 29, 25, 0.07);

  h2 {
    margin-top: 0;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 22px 0;
  color: #716b75;
`;

const Divider = styled.div`
  height: 1px;
  background: #eee9e5;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 22px 0;
  font-size: 1.2rem;

  strong {
    font-size: 1.5rem;
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  border: 0;
  border-radius: 14px;
  padding: 15px;
  background: #ff6b57;
  color: white;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const EmptyCart = styled.section`
  text-align: center;
  padding: 70px 20px;
  background: white;
  border: 1px solid #eee9e5;
  border-radius: 26px;

  span {
    font-size: 3rem;
  }

  h2 {
    margin-bottom: 8px;
  }

  p {
    color: #77717c;
    margin-bottom: 28px;
  }
`;

const BrowseLink = styled(Link)`
  display: inline-block;
  padding: 13px 22px;
  border-radius: 14px;
  background: #ff6b57;
  color: white;
  text-decoration: none;
  font-weight: 800;
`;

const Message = styled.p`
  text-align: center;
  margin-top: 80px;
`;

const ErrorMessage = styled.p`
  margin: 0 0 24px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--pink-soft);
  color: #9a4f45;
`;

const HomeLink = styled(Link)`
  display: block;
  width: fit-content;
  margin: 20px auto;
`;