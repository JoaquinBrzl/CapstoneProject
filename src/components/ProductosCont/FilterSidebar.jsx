import styled from "styled-components";
import { FiX } from "react-icons/fi";

export function FilterSidebar({
  filtrosActivos,
  setFiltrosActivos,
  categorias,
  onClose,
}) {
  // actualiza rl filtro de categoria segun se seleccione
  const handleCategoriaChange = (categoria) => {
    setFiltrosActivos((prev) => ({ ...prev, categoria }));
  };
  // Actualiza dinámicamente el precio mínimo o máximo en los filtros activos,
  // convirtiendo el valor ingresado a número. Si el valor es inválido o vacío, se asigna 0.
  const handlePrecioChange = (tipo, valor) => {
    setFiltrosActivos((prev) => ({
      ...prev,
      [tipo]: Number(valor) || 0,
    }));
  };
  // Actualiza el criterio de ordenamiento de los filtros activos según la opción seleccionada.
  const handlerOrdenChange = (ordenar) => {
    setFiltrosActivos((prev) => ({ ...prev, ordenar }));
  };
  const resetarFiltro = () => {
    setFiltrosActivos({
      categoria: "todas", // Muestra todas las categorías, sin filtrar
      precioMin: 0, // Precio mínimo por defecto
      precioMax: 99999, // Precio máximo muy alto (para incluir todo)
      ordenar: "nombre", // Ordena alfabéticamente por nombre
    });
  };
  return (
    <Container>
      <FilterHeader>
        <FilterTitle>Filtros</FilterTitle>
        <CloseButton onClick={onClose}>
          <FiX />
        </CloseButton>
      </FilterHeader>

      <FilterSection>
        <SectionTitle>Categorías</SectionTitle>
        <CategoryList>
          <CategoryOption
            active={filtrosActivos.categoria === "todas"}
            onClick={() => handleCategoriaChange("todas")}
          >
            Todas las Categorías
          </CategoryOption>
          {categorias.map((cat) => (
            <CategoryOption
              key={cat}
              active={filtrosActivos.categoria === cat}
              onClick={() => handleCategoriaChange(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </CategoryOption>
          ))}
        </CategoryList>
      </FilterSection>

      <FilterSection>
        <SectionTitle>Rango de Precios</SectionTitle>
        <PriceInputs>
          <PriceInput
            type="number"
            placeholder="Min"
            value={filtrosActivos.precioMin || ""}
            onChange={(e) => handlePrecioChange("precioMin", e.target.value)}
          />
          <span>Hasta</span>
          <PriceInput
            type="number"
            placeholder="Max"
            value={
              filtrosActivos.precioMax === 99999
                ? ""
                : filtrosActivos.precioMax
            }
            onChange={(e) => handlePrecioChange("precioMax", e.target.value)}
          />
        </PriceInputs>
      </FilterSection>

      <FilterSection>
        <SectionTitle>Ordenar por</SectionTitle>
        <SortOptions>
          <SortOption
            active={filtrosActivos.ordenar === "nombre"}
            onClick={() => handlerOrdenChange("nombre")}
          >
            Nombre
          </SortOption>
          <SortOption
            active={filtrosActivos.ordenar === "precio-asc"}
            onClick={() => handlerOrdenChange("precio-asc")}
          >
            Precio: Menor a Mayor
          </SortOption>
          <SortOption
            active={filtrosActivos.ordenar === "precio-desc"}
            onClick={() => handlerOrdenChange("precio-desc")}
          >
            Precio: Mayor a Menor
          </SortOption>
        </SortOptions>
      </FilterSection>

      <ResetButton onClick={resetarFiltro}>Limpiar Filtros</ResetButton>
    </Container>
  );
}

const Container = styled.div`
  /* estilos aquí */
  width: 300px;
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.text}10;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FilterTitle = styled.h2`
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 0.7;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  margin-bottom: 10px;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CategoryOption = styled.button`
  background: ${({ active, theme }) =>
    active ? theme.primary || "#3498db" : "transparent"};
  color: ${({ active, theme }) => (active ? "white" : theme.text)};
  border: 1px solid
    ${({ active, theme }) =>
      active ? theme.primary || "#3498db" : theme.text + "30"};
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s;

  &:hover {
    background: ${({ active, theme }) =>
      active ? theme.primary || "#3498db" : theme.text + "10"};
  }
`;

const PriceInputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PriceInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.text}30;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};

  &::placeholder {
    color: ${({ theme }) => theme.text}50;
  }
`;

const SortOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SortOption = styled.button`
  background: ${({ active, theme }) =>
    active ? theme.primary || "#3498db" : "transparent"};
  color: ${({ active, theme }) => (active ? "white" : theme.text)};
  border: 1px solid
    ${({ active, theme }) =>
      active ? theme.primary || "#3498db" : theme.text + "30"};
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s;

  &:hover {
    background: ${({ active, theme }) =>
      active ? theme.primary || "#3498db" : theme.text + "10"};
  }
`;

const ResetButton = styled.button`
  width: 100%;
  padding: 10px;
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: 2px solid ${({ theme }) => theme.text}30;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;

  &:hover {
    background: ${({ theme }) => theme.text}10;
  }
`;
