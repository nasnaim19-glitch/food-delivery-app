import styled from "styled-components";

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 620px;
  margin-top: 28px;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 15px 20px 15px 50px;

  border: 1px solid var(--border);
  border-radius: 999px;

  background: var(--surface);
  color: var(--text);

  font-size: 1rem;

  outline: none;
  box-shadow: var(--shadow-sm);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: #aaa29d;
  }

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px var(--primary-soft);
  }
`;

function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <SearchWrapper>
      <SearchIcon>🔎</SearchIcon>

      <SearchInput
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search"
      />
    </SearchWrapper>
  );
}

export default SearchBar;