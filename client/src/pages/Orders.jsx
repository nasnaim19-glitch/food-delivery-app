import { useEffect, useState } from "react";
import axios from "axios";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import styled from "styled-components";

const API_URL =
  "http://localhost:3001/api/orders";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reorderingId, setReorderingId] =
    useState(null);

  const [
    reorderFeedback,
    setReorderFeedback,
  ] = useState({
    orderId: null,
    message: "",
    isError: false,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          setError(
            "Please log in to view your orders."
          );

          return;
        }

        const response =
          await axios.get(
            API_URL,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setOrders(
          response.data
        );

        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleReorder = async (
    orderId
  ) => {
    try {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setReorderFeedback({
          orderId,
          message:
            "Please log in to reorder.",
          isError: true,
        });

        return;
      }

      setReorderingId(orderId);

      setReorderFeedback({
        orderId,
        message: "",
        isError: false,
      });

      const response =
        await axios.post(
          `${API_URL}/${orderId}/reorder`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setReorderFeedback({
        orderId,
        message:
          response.data.message ||
          "Order added to cart successfully",
        isError: false,
      });

      window.setTimeout(() => {
        navigate("/cart");
      }, 700);
    } catch (err) {
      setReorderFeedback({
        orderId,
        message:
          err.response?.data?.message ||
          "Could not reorder this order.",
        isError: true,
      });
    } finally {
      setReorderingId(null);
    }
  };

  if (loading) {
    return (
      <Page>
        <Message>
          Loading your orders...
        </Message>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Message>
          {error}
        </Message>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <Eyebrow>
          Your history
        </Eyebrow>

        <Title>
          My Orders
        </Title>

        <Subtitle>
          View your previous
          orders, totals and
          current order status.
        </Subtitle>
      </Header>

      {orders.length === 0 ? (
        <EmptyState>
          <Icon>
            🧾
          </Icon>

          <h2>
            No orders yet
          </h2>

          <p>
            Once you place an
            order, it will appear
            here.
          </p>

          <BrowseLink
            to="/restaurants"
          >
            Browse restaurants
          </BrowseLink>
        </EmptyState>
      ) : (
        <OrdersGrid>
          {orders.map(
            (order) => {
              const date =
                new Date(
                  order.createdAt
                );

              const itemCount =
                order.items.reduce(
                  (
                    sum,
                    item
                  ) =>
                    sum +
                    item.quantity,
                  0
                );

              const isReordering =
                reorderingId ===
                order.id;

              const feedbackForOrder =
                reorderFeedback.orderId ===
                order.id
                  ? reorderFeedback
                  : null;

              return (
                <OrderCard
                  key={order.id}
                >
                  <TopRow>
                    <div>
                      <OrderNumber>
                        Order #
                        {
                          order.id
                        }
                      </OrderNumber>

                      <RestaurantName>
                        {order
                          .restaurant
                          ?.name ||
                          "Restaurant"}
                      </RestaurantName>
                    </div>

                    <Status
                      $status={
                        order.status
                      }
                    >
                      {
                        order.status
                      }
                    </Status>
                  </TopRow>

                  <InfoGrid>
                    <InfoItem>
                      <span>
                        Date
                      </span>

                      <strong>
                        {date.toLocaleDateString()}
                      </strong>
                    </InfoItem>

                    <InfoItem>
                      <span>
                        Time
                      </span>

                      <strong>
                        {date.toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}
                      </strong>
                    </InfoItem>

                    <InfoItem>
                      <span>
                        Items
                      </span>

                      <strong>
                        {
                          itemCount
                        }
                      </strong>
                    </InfoItem>

                    <InfoItem>
                      <span>
                        Total
                      </span>

                      <strong>
                        ₪
                        {Number(
                          order.totalPrice
                        ).toFixed(
                          2
                        )}
                      </strong>
                    </InfoItem>
                  </InfoGrid>

                  <ItemsPreview>
                    {order.items.map(
                      (item) => (
                        <ItemPreview
                          key={
                            item.id
                          }
                        >
                          <span>
                            {
                              item.productName
                            }
                          </span>

                          <strong>
                            ×
                            {
                              item.quantity
                            }
                          </strong>
                        </ItemPreview>
                      )
                    )}
                  </ItemsPreview>

                  <Actions>
                    <ViewOrderLink
                      to={`/orders/${order.id}`}
                    >
                      View receipt
                    </ViewOrderLink>

                    <ReorderButton
                      type="button"
                      onClick={() =>
                        handleReorder(
                          order.id
                        )
                      }
                      disabled={
                        isReordering
                      }
                    >
                      {isReordering
                        ? "Adding to cart..."
                        : "🔁 Order again"}
                    </ReorderButton>
                  </Actions>

                  {feedbackForOrder
                    ?.message && (
                    <ReorderNotice
                      $error={
                        feedbackForOrder.isError
                      }
                    >
                      {feedbackForOrder.isError
                        ? "⚠️ "
                        : "✓ "}

                      {
                        feedbackForOrder.message
                      }
                    </ReorderNotice>
                  )}

                  <ReorderHint>
                    Reorder uses current
                    product prices and
                    current Happy Hour
                    discounts.
                  </ReorderHint>
                </OrderCard>
              );
            }
          )}
        </OrdersGrid>
      )}
    </Page>
  );
}

export default Orders;

const Page = styled.main`
  width: min(
    1180px,
    calc(100% - 40px)
  );
  margin: 0 auto;
  padding: 56px 0 90px;
`;

const Header = styled.header`
  margin-bottom: 36px;
`;

const Eyebrow = styled.span`
  color: #ff6b57;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
`;

const Title = styled.h1`
  margin: 8px 0;
  font-size: clamp(
    2.4rem,
    5vw,
    4rem
  );
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--text-soft);
  max-width: 620px;
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const OrderCard = styled.article`
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const OrderNumber = styled.div`
  color: var(--text-soft);
  font-size: 0.9rem;
  font-weight: 700;
`;

const RestaurantName = styled.h2`
  margin: 6px 0 0;
  font-size: 1.4rem;
`;

const Status = styled.span`
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 800;

  background: ${({ $status }) => {
    if ($status === "DELIVERED") {
      return "var(--primary-soft)";
    }

    if ($status === "READY") {
      return "var(--yellow-soft)";
    }

    if ($status === "PREPARING") {
      return "var(--accent-soft)";
    }

    return "#f4f1ed";
  }};

  color: ${({ $status }) => {
    if ($status === "DELIVERED") {
      return "var(--primary)";
    }

    if ($status === "READY") {
      return "#7a6418";
    }

    if ($status === "PREPARING") {
      return "#8b561f";
    }

    return "#625d59";
  }};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 16px;
  margin: 24px 0;

  @media (max-width: 750px) {
    grid-template-columns:
      repeat(2, 1fr);
  }
`;

const InfoItem = styled.div`
  display: grid;
  gap: 5px;

  span {
    color: var(--text-soft);
    font-size: 0.85rem;
  }
`;

const ItemsPreview = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 20px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #fbf9f6;
  border: 1px solid #f0ebe6;
`;

const ItemPreview = styled.div`
  display: flex;
  justify-content:
    space-between;
  gap: 18px;
  color: var(--text-soft);

  strong {
    color: var(--text);
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const ViewOrderLink = styled(Link)`
  display: inline-flex;
  padding: 11px 16px;
  border-radius: 999px;
  background: var(--primary);
  color: white;
  text-decoration: none;
  font-weight: 800;
`;

const ReorderButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 16px;
  border: 0;
  border-radius: 999px;
  background: var(--accent-soft);
  color: #7a4b1f;
  font-family: inherit;
  font-size: inherit;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;

  &:hover:not(:disabled) {
    transform:
      translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

const ReorderNotice = styled.div`
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 14px;

  background: ${({ $error }) =>
    $error
      ? "var(--pink-soft)"
      : "var(--primary-soft)"};

  color: ${({ $error }) =>
    $error
      ? "#9a4f45"
      : "var(--primary)"};

  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.5;
`;

const ReorderHint = styled.p`
  margin: 12px 0 0;
  color: var(--text-soft);
  font-size: 0.8rem;
`;

const EmptyState = styled.section`
  text-align: center;
  padding: 70px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);

  h2 {
    margin-bottom: 8px;
  }

  p {
    color: var(--text-soft);
    margin-bottom: 26px;
  }
`;

const Icon = styled.div`
  font-size: 3rem;
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