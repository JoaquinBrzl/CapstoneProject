import styled from "styled-components";
import { FiSearch,FiX } from "react-icons/fi";

export function SearchBar({ busqueda, setBusqueda }) {
  return (
    <Container>
      <SearchIcon>
        <FiSearch />
      </SearchIcon>
      <SearchInput
        type="text"
        placeholder="Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      {busqueda && (
        <ClearButton onClick={() => setBusqueda("")}>
          <FiX />
        </ClearButton>
      )}
    </Container>
  );
}

const Container = styled.div`
  /* estilos aquí */
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.bg};
  border: 2px solid ${({ theme }) => theme.text}20;
  border-radius: 8px;
  padding: 0 15px;
  flex: 1;
  max-width: 400px;
`;

const SearchIcon = styled.div`
  /* estilos aquí */
  color: ${({ theme }) => theme.text}60;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  /* estilos aquí */
  flex: 1;
  border: none;
  background: none;
  padding: 10px;
  font-size: 16px;
  color: ${({ theme }) => theme.text};
  outline: none;
  &::placeholder {
    color: ${({ theme }) => theme.text}50;
  }
`;

const ClearButton = styled.button`
  /* estilos aquí */
  background: none;
  border: none;
  color: ${({ theme }) => theme.text}60;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 5px;
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

//probando la Pagina
//jajajajjajajajajaa