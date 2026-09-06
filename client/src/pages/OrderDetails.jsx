import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const API_URL = "http://localhost:3001/api/orders";

const REFRESH_INTERVAL = 5000;

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let intervalId;

    const fetchOrder = async (showLoader = false) => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
          setError("Please log in to view this order.");
          setLoading(false);
          return null;
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (showLoader) {
          setLoading(true);
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
        setError("");

        return response.data;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load order details."
        );

        return null;
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    };

    const startTracking = async () => {
      const firstOrder = await fetchOrder(true);

      if (
        !firstOrder ||
        firstOrder.tracking?.isCompleted
      ) {
        return;
      }

      intervalId = window.setInterval(
        async () => {
          const updatedOrder =
            await fetchOrder(false);

          if (
            updatedOrder?.tracking?.isCompleted
          ) {
            window.clearInterval(intervalId);
          }
        },
        REFRESH_INTERVAL
      );
    };

    startTracking();

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [id]);

  if (loading) {
    return (
      <Page>
        <Message>
          Loading order...
        </Message>
      </Page>
    );
  }

  if (error && !order) {
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

  const orderDate =
    new Date(order.createdAt);

  const tracking =
    order.tracking;

  const hasHappyHourDiscount =
    order.items.some(
      (item) =>
        Number(item.discountPercent) > 0
    );

  const originalOrderTotal =
    order.items.reduce(
      (sum, item) => {
        const originalPrice =
          item.originalUnitPrice !== null &&
          item.originalUnitPrice !== undefined
            ? Number(item.originalUnitPrice)
            : Number(item.unitPrice);

        return (
          sum +
          originalPrice *
            item.quantity
        );
      },
      0
    );

  const savings = Math.max(
    0,
    originalOrderTotal -
      Number(order.totalPrice)
  );

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

        {tracking && (
          <TrackingSection>
            <TrackingTop>
              <div>
                <TrackingEyebrow>
                  Live order tracking
                </TrackingEyebrow>

                <TrackingTitle>
                  {getTrackingTitle(
                    tracking.status
                  )}
                </TrackingTitle>

                <TrackingSubtitle>
                  {getTrackingSubtitle(
                    tracking.status
                  )}
                </TrackingSubtitle>
              </div>

              <TrackingTimeCard>
                {tracking.isCompleted ? (
                  <>
                    <TrackingTimeLabel>
                      Status
                    </TrackingTimeLabel>

                    <TrackingTimeValue>
                      Delivered
                    </TrackingTimeValue>
                  </>
                ) : (
                  <>
                    <TrackingTimeLabel>
                      Estimated time
                    </TrackingTimeLabel>

                    <TrackingTimeValue>
                      About{" "}
                      {tracking.remainingMinutes}{" "}
                      min
                    </TrackingTimeValue>
                  </>
                )}
              </TrackingTimeCard>
            </TrackingTop>

            <ProgressInfo>
              <span>
                Progress
              </span>

              <strong>
                {tracking.progressPercent}%
              </strong>
            </ProgressInfo>

            <ProgressTrack>
              <ProgressFill
                $progress={
                  tracking.progressPercent
                }
              />
            </ProgressTrack>

            <TrackingSteps>
              {tracking.steps.map(
                (step, index) => (
                  <TrackingStep
                    key={step.key}
                    $active={step.active}
                    $completed={step.completed}
                  >
                    <StepMarker
                      $active={step.active}
                      $completed={
                        step.completed
                      }
                    >
                      {step.completed
                        ? "✓"
                        : step.active
                          ? getStepIcon(
                              step.key
                            )
                          : index + 1}
                    </StepMarker>

                    <StepContent>
                      <StepLabel
                        $active={
                          step.active
                        }
                        $completed={
                          step.completed
                        }
                      >
                        {step.label}
                      </StepLabel>

                      <StepDescription>
                        {
                          step.description
                        }
                      </StepDescription>
                    </StepContent>
                  </TrackingStep>
                )
              )}
            </TrackingSteps>

            <TrackingFooter>
              {tracking.isCompleted ? (
                <CompletedMessage>
                  💚 Your order has been
                  completed. Enjoy your meal!
                </CompletedMessage>
              ) : (
                <>
                  <LiveIndicator>
                    <LiveDot />
                    Live updates
                  </LiveIndicator>

                  <EstimatedText>
                    Estimated completion:{" "}
                    {formatEstimatedTime(
                      tracking.estimatedDeliveryAt
                    )}
                  </EstimatedText>
                </>
              )}
            </TrackingFooter>
          </TrackingSection>
        )}

        {hasHappyHourDiscount && (
          <HappyHourBanner>
            <HappyHourIcon>
              ✨
            </HappyHourIcon>

            <div>
              <HappyHourTitle>
                Happy Hour savings
                applied!
              </HappyHourTitle>

              <HappyHourText>
                Your order received
                special Happy Hour
                pricing.
              </HappyHourText>
            </div>

            <HappyHourSaving>
              You saved ₪
              {savings.toFixed(2)}
            </HappyHourSaving>
          </HappyHourBanner>
        )}

        <InformationGrid>
          <InfoBox>
            <InfoTitle>
              Customer
            </InfoTitle>

            <InfoValue>
              {user?.name ||
                "Customer"}
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
                {
                  order.restaurant
                    .city
                }
              </InfoText>
            )}

            {order.restaurant
              ?.address && (
              <InfoText>
                {
                  order.restaurant
                    .address
                }
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
              {orderDate.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </InfoText>
          </InfoBox>

          <InfoBox>
            <InfoTitle>
              Order status
            </InfoTitle>

            <InfoValue>
              {formatStatus(
                order.status
              )}
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
            <span>
              Unit price
            </span>
            <span>Total</span>
          </ItemsHeader>

          {order.items.map(
            (item) => {
              const hasDiscount =
                Number(
                  item.discountPercent
                ) > 0 &&
                item.originalUnitPrice !==
                  null &&
                item.originalUnitPrice !==
                  undefined;

              const originalPrice =
                hasDiscount
                  ? Number(
                      item.originalUnitPrice
                    )
                  : Number(
                      item.unitPrice
                    );

              const paidPrice =
                Number(
                  item.unitPrice
                );

              return (
                <ItemRow
                  key={item.id}
                >
                  <ProductDetails>
                    <ProductName>
                      {
                        item.productName
                      }
                    </ProductName>

                    {hasDiscount && (
                      <DiscountBadge>
                        Happy Hour{" "}
                        {
                          item.discountPercent
                        }
                        % OFF
                      </DiscountBadge>
                    )}
                  </ProductDetails>

                  <Quantity>
                    {item.quantity}
                  </Quantity>

                  <PriceCell>
                    {hasDiscount ? (
                      <>
                        <OriginalPrice>
                          ₪
                          {originalPrice.toFixed(
                            2
                          )}
                        </OriginalPrice>

                        <DiscountedPrice>
                          ₪
                          {paidPrice.toFixed(
                            2
                          )}
                        </DiscountedPrice>
                      </>
                    ) : (
                      <RegularPrice>
                        ₪
                        {paidPrice.toFixed(
                          2
                        )}
                      </RegularPrice>
                    )}
                  </PriceCell>

                  <ItemTotal>
                    ₪
                    {(
                      paidPrice *
                      item.quantity
                    ).toFixed(2)}
                  </ItemTotal>
                </ItemRow>
              );
            }
          )}
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
                  sum +
                  item.quantity,
                0
              )}
            </span>
          </SummaryRow>

          {hasHappyHourDiscount && (
            <>
              <SummaryRow>
                <span>
                  Original subtotal
                </span>

                <OriginalSummaryPrice>
                  ₪
                  {originalOrderTotal.toFixed(
                    2
                  )}
                </OriginalSummaryPrice>
              </SummaryRow>

              <SavingsRow>
                <span>
                  Happy Hour savings
                </span>

                <strong>
                  -₪
                  {savings.toFixed(2)}
                </strong>
              </SavingsRow>
            </>
          )}

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
            Thank you for ordering
            with FreshBite.
          </p>

          {hasHappyHourDiscount && (
            <FooterSaving>
              ✨ You saved ₪
              {savings.toFixed(2)}{" "}
              with Happy Hour
            </FooterSaving>
          )}

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

function getStatusDescription(
  status
) {
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

  return (
    descriptions[status] || ""
  );
}

function getTrackingTitle(
  status
) {
  const titles = {
    PENDING:
      "We received your order",

    PREPARING:
      "Your food is being prepared",

    READY:
      "Your order is ready",

    DELIVERED:
      "Order completed",
  };

  return titles[status] || status;
}

function getTrackingSubtitle(
  status
) {
  const subtitles = {
    PENDING:
      "The restaurant is reviewing your order.",

    PREPARING:
      "The kitchen is preparing your delicious meal.",

    READY:
      "Everything is ready and your order is almost complete.",

    DELIVERED:
      "Your order journey is complete.",
  };

  return (
    subtitles[status] || ""
  );
}

function getStepIcon(step) {
  const icons = {
    PENDING: "✓",
    PREPARING: "🔥",
    READY: "🥡",
    DELIVERED: "💚",
  };

  return icons[step] || "•";
}

function formatEstimatedTime(
  estimatedDeliveryAt
) {
  if (!estimatedDeliveryAt) {
    return "";
  }

  return new Date(
    estimatedDeliveryAt
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default OrderDetails;

const livePulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.4);
    opacity: 0.55;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const activeStepPulse = keyframes`
  0% {
    box-shadow:
      0 0 0 0 rgba(255, 107, 87, 0.35);
  }

  70% {
    box-shadow:
      0 0 0 10px rgba(255, 107, 87, 0);
  }

  100% {
    box-shadow:
      0 0 0 0 rgba(255, 107, 87, 0);
  }
`;

const Page = styled.main`
  width: min(
    1000px,
    calc(100% - 40px)
  );
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
    if (
      $status === "DELIVERED"
    ) {
      return "var(--primary-soft)";
    }

    if ($status === "READY") {
      return "var(--yellow-soft)";
    }

    if (
      $status === "PREPARING"
    ) {
      return "var(--accent-soft)";
    }

    return "#f4f1ed";
  }};

  color: ${({ $status }) => {
    if (
      $status === "DELIVERED"
    ) {
      return "var(--primary)";
    }

    if ($status === "READY") {
      return "#7a6418";
    }

    if (
      $status === "PREPARING"
    ) {
      return "#8b561f";
    }

    return "#625d59";
  }};
`;

const TrackingSection =
  styled.section`
    margin-top: 28px;
    padding: 26px;
    border: 1px solid #ebe6df;
    border-radius: 24px;
    background: linear-gradient(
      145deg,
      #ffffff,
      #fbfaf7
    );
    box-shadow:
      0 12px 34px
      rgba(44, 38, 34, 0.06);
  `;

const TrackingTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 650px) {
    flex-direction: column;
  }
`;

const TrackingEyebrow =
  styled.div`
    margin-bottom: 7px;
    color: #ff6b57;
    font-size: 0.76rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  `;

const TrackingTitle =
  styled.h2`
    margin: 0;
    font-size: 1.6rem;
    color: var(--text);
  `;

const TrackingSubtitle =
  styled.p`
    margin: 8px 0 0;
    color: var(--text-soft);
    line-height: 1.6;
  `;

const TrackingTimeCard =
  styled.div`
    flex-shrink: 0;
    min-width: 150px;
    padding: 13px 16px;
    border-radius: 16px;
    background: var(--primary-soft);
  `;

const TrackingTimeLabel =
  styled.div`
    color: var(--text-soft);
    font-size: 0.78rem;
    font-weight: 700;
  `;

const TrackingTimeValue =
  styled.strong`
    display: block;
    margin-top: 4px;
    color: var(--primary);
    font-size: 1.1rem;
  `;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 28px;
  color: var(--text-soft);
  font-size: 0.85rem;

  strong {
    color: var(--primary);
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 9px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #eeeae5;
`;

const ProgressFill = styled.div`
  width: ${({ $progress }) =>
    `${$progress}%`};
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    #2f6f61,
    #67a893
  );
  transition: width 0.5s ease;
`;

const TrackingSteps =
  styled.div`
    display: grid;
    grid-template-columns:
      repeat(4, 1fr);
    gap: 12px;
    margin-top: 30px;

    @media (max-width: 750px) {
      grid-template-columns:
        1fr 1fr;
    }

    @media (max-width: 480px) {
      grid-template-columns:
        1fr;
    }
  `;

const TrackingStep = styled.div`
  padding: 16px;
  border-radius: 18px;

  background: ${({
    $active,
    $completed,
  }) => {
    if ($active) {
      return "#fff4ef";
    }

    if ($completed) {
      return "var(--primary-soft)";
    }

    return "#f8f6f3";
  }};

  border: 1px solid
    ${({
      $active,
      $completed,
    }) => {
      if ($active) {
        return "#f3b29f";
      }

      if ($completed) {
        return "#cce2da";
      }

      return "#eee9e3";
    }};
`;

const StepMarker = styled.div`
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  margin-bottom: 12px;
  border-radius: 50%;

  background: ${({
    $active,
    $completed,
  }) => {
    if ($active) {
      return "#ff6b57";
    }

    if ($completed) {
      return "var(--primary)";
    }

    return "#ded9d3";
  }};

  color: white;
  font-weight: 900;

  animation: ${({ $active }) =>
      $active
        ? activeStepPulse
        : "none"}
    1.8s infinite;
`;

const StepContent = styled.div`
  display: grid;
  gap: 5px;
`;

const StepLabel = styled.div`
  color: ${({
    $active,
    $completed,
  }) =>
    $active
      ? "#cf4e3b"
      : $completed
        ? "var(--primary)"
        : "var(--text)"};
  font-weight: 900;
`;

const StepDescription =
  styled.p`
    margin: 0;
    color: var(--text-soft);
    font-size: 0.8rem;
    line-height: 1.45;
  `;

const TrackingFooter =
  styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-top: 24px;
    padding-top: 18px;
    border-top: 1px solid #eee9e3;

    @media (max-width: 650px) {
      align-items: flex-start;
      flex-direction: column;
    }
  `;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 800;
`;

const LiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);

  animation:
    ${livePulse}
    1.4s ease-in-out infinite;
`;

const EstimatedText =
  styled.span`
    color: var(--text-soft);
    font-size: 0.85rem;
  `;

const CompletedMessage =
  styled.div`
    width: 100%;
    padding: 12px 14px;
    border-radius: 14px;
    background: var(--primary-soft);
    color: var(--primary);
    text-align: center;
    font-weight: 800;
  `;

const HappyHourBanner =
  styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 26px;
    padding: 17px 18px;
    border: 1px solid #f5d68d;
    border-radius: 18px;

    background:
      linear-gradient(
        135deg,
        #fff9e8,
        #fff4d4
      );

    @media (max-width: 650px) {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  `;

const HappyHourIcon =
  styled.span`
    font-size: 1.7rem;
  `;

const HappyHourTitle =
  styled.div`
    color: #74551a;
    font-weight: 900;
  `;

const HappyHourText =
  styled.div`
    margin-top: 3px;
    color: #8c7344;
    font-size: 0.88rem;
  `;

const HappyHourSaving =
  styled.strong`
    margin-left: auto;
    padding: 8px 12px;
    border-radius: 999px;
    background: white;
    color: var(--primary);
    white-space: nowrap;
  `;

const InformationGrid =
  styled.section`
    display: grid;
    grid-template-columns:
      repeat(2, 1fr);
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

const ItemsSection =
  styled.section``;

const SectionTitle = styled.h2`
  margin: 0 0 18px;
`;

const ItemsHeader = styled.div`
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    70px
    130px
    110px;
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
    minmax(0, 1fr)
    70px
    130px
    110px;
  gap: 14px;
  align-items: center;
  padding: 16px 0;
  border-top:
    1px solid #f1ece7;

  @media (max-width: 650px) {
    grid-template-columns:
      1fr 1fr;
  }
`;

const ProductDetails =
  styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 7px;
  `;

const ProductName =
  styled.strong`
    color: var(--text);
  `;

const DiscountBadge =
  styled.span`
    display: inline-flex;
    padding: 5px 9px;
    border-radius: 999px;
    background: #fff2c8;
    color: #856317;
    font-size: 0.75rem;
    font-weight: 900;
  `;

const Quantity = styled.span`
  color: var(--text);
`;

const PriceCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
`;

const OriginalPrice =
  styled.span`
    color: var(--text-soft);
    font-size: 0.82rem;
    text-decoration:
      line-through;
  `;

const DiscountedPrice =
  styled.strong`
    color: var(--primary);
    font-size: 1rem;
  `;

const RegularPrice =
  styled.span`
    color: var(--text);
  `;

const ItemTotal =
  styled.strong`
    color: #ff6b57;
  `;

const Summary = styled.section`
  width: min(400px, 100%);
  margin-left: auto;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content:
    space-between;
  gap: 20px;
  margin-bottom: 16px;
  color: var(--text-soft);
`;

const OriginalSummaryPrice =
  styled.span`
    text-decoration:
      line-through;
  `;

const SavingsRow =
  styled.div`
    display: flex;
    justify-content:
      space-between;
    gap: 20px;
    margin-bottom: 18px;
    padding: 11px 13px;
    border-radius: 12px;
    background: #fff8dc;
    color: #80631c;
    font-weight: 800;

    strong {
      color: var(--primary);
    }
  `;

const TotalRow = styled.div`
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 20px;
  padding-top: 16px;
  border-top:
    1px solid var(--border);
  font-size: 1.25rem;

  strong {
    color: var(--primary);
    font-size: 1.6rem;
  }
`;

const Footer = styled.footer`
  margin-top: 40px;
  padding: 28px 20px 0;
  border-top:
    1px dashed var(--border);
  text-align: center;

  > span {
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

const FooterSaving =
  styled.div`
    width: fit-content;
    margin: 10px auto 14px;
    padding: 7px 11px;
    border-radius: 999px;
    background: #fff8dc;
    color: #80631c;
    font-size: 0.82rem;
    font-weight: 800;
  `;

const Message = styled.p`
  text-align: center;
  margin-top: 80px;
`;