import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        "http://localhost:3001/api/auth/login",
        formData
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      window.dispatchEvent(
        new Event("auth-change")
      );

      navigate("/restaurants");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <Badge>Welcome back</Badge>

        <Title>Login to FreshBite</Title>

        <Subtitle>
          Sign in to manage your cart, orders and favorite restaurants.
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <Label>
            Email

            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </Label>

          <Label>
            Password

            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </Label>

          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}

          <SubmitButton
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </SubmitButton>
        </Form>

        <BottomText>
          Don&apos;t have an account?{" "}

          <RegisterLink to="/register">
            Create one
          </RegisterLink>
        </BottomText>
      </Card>
    </Page>
  );
}

export default Login;

const Page = styled.main`
  min-height: calc(100vh - 80px);
  display: grid;
  place-items: center;
  padding: 48px 20px;
`;

const Card = styled.section`
  width: min(460px, 100%);
  padding: 38px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
`;

const Badge = styled.span`
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 800;
`;

const Title = styled.h1`
  margin: 18px 0 8px;
  font-size: 2rem;
`;

const Subtitle = styled.p`
  margin: 0 0 28px;
  color: var(--text-soft);
  line-height: 1.7;
`;

const Form = styled.form`
  display: grid;
  gap: 18px;
`;

const Label = styled.label`
  display: grid;
  gap: 8px;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  padding: 13px 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: white;
  outline: none;

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px var(--primary-soft);
  }
`;

const SubmitButton = styled.button`
  border: 0;
  border-radius: 14px;
  padding: 14px;
  background: var(--primary);
  color: white;
  font-weight: 800;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  margin: 0;
  padding: 11px 13px;
  border-radius: 12px;
  background: var(--pink-soft);
  color: #9a4f45;
`;

const BottomText = styled.p`
  margin: 24px 0 0;
  text-align: center;
  color: var(--text-soft);
`;

const RegisterLink = styled(Link)`
  color: var(--primary);
  font-weight: 800;
  text-decoration: none;
`;