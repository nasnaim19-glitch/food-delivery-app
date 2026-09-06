import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";

const API_URL = "http://localhost:3001/api/orders";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
          setError("Please log in to view this order.");
          return;
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const response = await axios.get(
          `${API_URL}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrder(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load order details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <Page>
        <Message>Loading order...</Message>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Message>{error}</Message>

        <BackLink to="/orders">
          Back to my orders
        </BackLink>
      </Page>
    );
  }

  if (!order) {
    return null;
  }

  const orderDate = new Date(order.createdAt);

  return (
    <Page>
      <TopActions>
        <BackLink to="/orders">
          ← Back to my orders
        </BackLink>
      </TopActions>

      <Receipt>
        <ReceiptHeader>
          <Brand>
            FreshBite
          </Brand>

          <ReceiptLabel>
            Order Receipt
          </ReceiptLabel>
        </ReceiptHeader>

        <Divider />

        <OrderHeading>
          <div>
            <SmallLabel>
              Order number
            </SmallLabel>

            <OrderNumber>
              #{order.id}
            </OrderNumber>
          </div>

          <Status $status={order.status}>
            {order.status}
          </Status>
        </OrderHeading>

        <InformationGrid>
          <InfoBox>
            <InfoTitle>
              Customer
            </InfoTitle>

            <InfoValue>
              {user?.name || "Customer"}
            </InfoValue>

            <InfoText>
              {user?.email || ""}
            </InfoText>
          </InfoBox>

          <InfoBox>
            <InfoTitle>
              Restaurant
            </InfoTitle>

            <InfoValue>
              {order.restaurant?.name ||
                "Restaurant"}
            </InfoValue>

            {order.restaurant?.city && (
              <InfoText>
                {order.restaurant.city}
              </InfoText>
            )}

            {order.restaurant?.address && (
              <InfoText>
                {order.restaurant.address}
              </InfoText>
            )}
          </InfoBox>

          <InfoBox>
            <InfoTitle>
              Date
            </InfoTitle>

            <InfoValue>
              {orderDate.toLocaleDateString()}
            </InfoValue>

            <InfoText>
              {orderDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </InfoText>
          </InfoBox>

          <InfoBox>
            <InfoTitle>
              Order status
            </InfoTitle>

            <InfoValue>
              {formatStatus(order.status)}
            </InfoValue>

            <InfoText>
              {getStatusDescription(
                order.status
              )}
            </InfoText>
          </InfoBox>
        </InformationGrid>

        <Divider />

        <ItemsSection>
          <SectionTitle>
            Order items
          </SectionTitle>

          <ItemsHeader>
            <span>Item</span>
            <span>Qty</span>
            <span>Unit price</span>
            <span>Total</span>
          </ItemsHeader>

          {order.items.map((item) => (
            <ItemRow key={item.id}>
              <ProductName>
                {item.productName}
              </ProductName>

              <span>
                {item.quantity}
              </span>

              <span>
                ₪{Number(
                  item.unitPrice
                ).toFixed(2)}
              </span>

              <ItemTotal>
                ₪
                {(
                  Number(item.unitPrice) *
                  item.quantity
                ).toFixed(2)}
              </ItemTotal>
            </ItemRow>
          ))}
        </ItemsSection>

        <Divider />

        <Summary>
          <SummaryRow>
            <span>
              Total items
            </span>

            <span>
              {order.items.reduce(
                (sum, item) =>
                  sum + item.quantity,
                0
              )}
            </span>
          </SummaryRow>

          <TotalRow>
            <span>
              Order total
            </span>

            <strong>
              ₪
              {Number(
                order.totalPrice
              ).toFixed(2)}
            </strong>
          </TotalRow>
        </Summary>

        <Footer>
          <span>💚</span>

          <p>
            Thank you for ordering with
            FreshBite.
          </p>

          <small>
            Order #{order.id} •{" "}
            {orderDate.toLocaleString()}
          </small>
        </Footer>
      </Receipt>
    </Page>
  );
}

function formatStatus(status) {
  const labels = {
    PENDING: "Order received",
    PREPARING: "Preparing",
    READY: "Ready",
    DELIVERED: "Delivered",
  };

  return labels[status] || status;
}

function getStatusDescription(status) {
  const descriptions = {
    PENDING:
      "The restaurant received your order.",
    PREPARING:
      "Your food is being prepared.",
    READY:
      "Your order is ready.",
    DELIVERED:
      "Your order has been completed.",
  };

  return descriptions[status] || "";
}

export default OrderDetails;

const Page = styled.main`
  width: min(1000px, calc(100% - 40px));
  margin: 0 auto;
  padding: 48px 0 90px;
`;

const TopActions = styled.div`
  margin-bottom: 20px;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  color: var(--primary);
  text-decoration: none;
  font-weight: 800;
`;

const Receipt = styled.article`
  padding: 38px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);

  @media (max-width: 600px) {
    padding: 24px 18px;
  }
`;

const ReceiptHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

const Brand = styled.div`
  color: var(--primary);
  font-size: 1.8rem;
  font-weight: 900;
`;

const ReceiptLabel = styled.div`
  padding: 8px 13px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 800;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border);
  margin: 28px 0;
`;

const OrderHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

const SmallLabel = styled.span`
  color: var(--text-soft);
  font-size: 0.85rem;
`;

const OrderNumber = styled.h1`
  margin: 4px 0 0;
  font-size: 2.4rem;
`;

const Status = styled.span`
  padding: 9px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 900;

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

const InformationGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-top: 30px;

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBox = styled.div`
  padding: 18px;
  border-radius: 18px;
  background: #fbf9f6;
  border: 1px solid #f0ebe6;
`;

const InfoTitle = styled.div`
  margin-bottom: 7px;
  color: var(--text-soft);
  font-size: 0.82rem;
  font-weight: 700;
`;

const InfoValue = styled.div`
  font-weight: 900;
`;

const InfoText = styled.div`
  margin-top: 4px;
  color: var(--text-soft);
  font-size: 0.9rem;
`;

const ItemsSection = styled.section``;

const SectionTitle = styled.h2`
  margin: 0 0 18px;
`;

const ItemsHeader = styled.div`
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) 70px 110px 110px;
  gap: 14px;
  padding-bottom: 12px;
  color: var(--text-soft);
  font-size: 0.82rem;
  font-weight: 800;

  @media (max-width: 650px) {
    display: none;
  }
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) 70px 110px 110px;
  gap: 14px;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #f1ece7;

  @media (max-width: 650px) {
    grid-template-columns: 1fr 1fr;

    span {
      color: var(--text-soft);
    }
  }
`;

const ProductName = styled.strong`
  color: var(--text);
`;

const ItemTotal = styled.strong`
  color: #ff6b57;
`;

const Summary = styled.section`
  width: min(380px, 100%);
  margin-left: auto;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  color: var(--text-soft);
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;

  strong {
    color: var(--primary);
    font-size: 1.6rem;
  }
`;

const Footer = styled.footer`
  margin-top: 40px;
  padding: 28px 20px 0;
  border-top: 1px dashed var(--border);
  text-align: center;

  span {
    font-size: 1.7rem;
  }

  p {
    margin: 8px 0;
    font-weight: 800;
  }

  small {
    color: var(--text-soft);
  }
`;

const Message = styled.p`
  text-align: center;
  margin-top: 80px;
`;