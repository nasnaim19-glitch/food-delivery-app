import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styled from "styled-components";

const API_URL = "http://localhost:3001/api/orders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your orders.");
          return;
        }

        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data);
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

  if (loading) {
    return (
      <Page>
        <Message>Loading your orders...</Message>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Message>{error}</Message>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <Eyebrow>Your history</Eyebrow>
        <Title>My Orders</Title>
        <Subtitle>
          View your previous orders, totals and current order status.
        </Subtitle>
      </Header>

      {orders.length === 0 ? (
        <EmptyState>
          <Icon>🧾</Icon>

          <h2>No orders yet</h2>

          <p>
            Once you place an order, it will appear here.
          </p>

          <BrowseLink to="/restaurants">
            Browse restaurants
          </BrowseLink>
        </EmptyState>
      ) : (
        <OrdersGrid>
          {orders.map((order) => {
            const date = new Date(order.createdAt);

            return (
              <OrderCard key={order.id}>
                <TopRow>
                  <div>
                    <OrderNumber>
                      Order #{order.id}
                    </OrderNumber>

                    <RestaurantName>
                      {order.restaurant?.name ||
                        "Restaurant"}
                    </RestaurantName>
                  </div>

                  <Status $status={order.status}>
                    {order.status}
                  </Status>
                </TopRow>

                <InfoGrid>
                  <InfoItem>
                    <span>Date</span>
                    <strong>
                      {date.toLocaleDateString()}
                    </strong>
                  </InfoItem>

                  <InfoItem>
                    <span>Time</span>
                    <strong>
                      {date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </strong>
                  </InfoItem>

                  <InfoItem>
                    <span>Items</span>
                    <strong>
                      {order.items.reduce(
                        (sum, item) =>
                          sum + item.quantity,
                        0
                      )}
                    </strong>
                  </InfoItem>

                  <InfoItem>
                    <span>Total</span>
                    <strong>
                      ₪{Number(
                        order.totalPrice
                      ).toFixed(2)}
                    </strong>
                  </InfoItem>
                </InfoGrid>

                <ViewOrderLink
                  to={`/orders/${order.id}`}
                >
                  View receipt
                </ViewOrderLink>
              </OrderCard>
            );
          })}
        </OrdersGrid>
      )}
    </Page>
  );
}

export default Orders;

const Page = styled.main`
  width: min(1180px, calc(100% - 40px));
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
  font-size: clamp(2.4rem, 5vw, 4rem);
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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 24px 0;

  @media (max-width: 750px) {
    grid-template-columns: repeat(2, 1fr);
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

const ViewOrderLink = styled(Link)`
  display: inline-flex;
  padding: 11px 16px;
  border-radius: 999px;
  background: var(--primary);
  color: white;
  text-decoration: none;
  font-weight: 800;
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