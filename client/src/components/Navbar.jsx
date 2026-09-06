import { NavLink } from "react-router-dom";
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

function Navbar() {
  return (
    <Nav>
      <Logo to="/">FreshBite</Logo>

      <Links>
        <StyledLink to="/">Home</StyledLink>
        <StyledLink to="/restaurants">Restaurants</StyledLink>

        <LoginButton to="/login">Login</LoginButton>
      </Links>
    </Nav>
  );
}

export default Navbar;