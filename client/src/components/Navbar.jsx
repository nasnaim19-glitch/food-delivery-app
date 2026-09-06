import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 32px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid #f1eee8;
`;

const Logo = styled(NavLink)`
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  color: #2f6f61;
  letter-spacing: -0.5px;
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const StyledLink = styled(NavLink)`
  text-decoration: none;
  color: #4f4f4f;
  font-weight: 600;
  transition: 0.2s ease;

  &:hover {
    color: #2f6f61;
  }

  &.active {
    color: #2f6f61;
  }
`;

const CartLink = styled(NavLink)`
  text-decoration: none;
  color: #2f6f61;
  font-weight: 700;
  padding: 9px 14px;
  border-radius: 999px;
  background: var(--primary-soft);
  transition: 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const LoginButton = styled(NavLink)`
  text-decoration: none;
  background: #f7b267;
  color: #3f2f23;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 999px;
  transition: 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const LogoutButton = styled.button`
  border: none;
  background: #f7b267;
  color: #3f2f23;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  transition: 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  useEffect(() => {
    const updateAuthState = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("token")));
    };

    window.addEventListener("auth-change", updateAuthState);
    window.addEventListener("storage", updateAuthState);

    return () => {
      window.removeEventListener("auth-change", updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");

    window.dispatchEvent(new Event("auth-change"));

    navigate("/login");
  };

  return (
    <Nav>
      <Logo to="/">FreshBite</Logo>

      <Links>
        <StyledLink to="/">
          Home
        </StyledLink>

        <StyledLink to="/restaurants">
          Restaurants
        </StyledLink>

        {isLoggedIn && (
          <CartLink to="/cart">
            🛒 Cart
          </CartLink>
        )}

        {isLoggedIn ? (
          <LogoutButton
            type="button"
            onClick={handleLogout}
          >
            Logout
          </LogoutButton>
        ) : (
          <LoginButton to="/login">
            Login
          </LoginButton>
        )}
      </Links>
    </Nav>
  );
}

export default Navbar;