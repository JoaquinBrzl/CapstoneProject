import styled, { keyframes } from "styled-components";
import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FiFilter } from "react-icons/fi";
import { ProductCard } from "../components/ProductosCont/ProductCard";
import { SearchBar } from "../components/ProductosCont/SearchBar";
import { FilterSidebar } from "../components/ProductosCont/FilterSidebar";

export function Productos() {
  // Estados primcipales
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtrosActivos, setFiltrosActivos] = useState({
    categoria: "todas",
    precioMin: 0,
    precioMax: 99999,
    ordenar: "nombre",
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Cargar productos de firebase al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  // Cargar productos de firebase
  const cargarProductos = async () => {
    try {
      setLoading(true);

      const productosRef = collection(db, "productos");
      const snapshot = await getDocs(productosRef);
      const productosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProductos(productosData);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar productos: ", error);
      setLoading(false);
    }
  };

  // Funcion para aplicar todos los filtros
  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];

    // filtrar por busqueda
    if (busqueda) {
      resultado = resultado.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtrar por categoria
    if (filtrosActivos.categoria !== "todas") {
      resultado = resultado.filter(
        (producto) => producto.categoria === filtrosActivos.categoria
      );
    }

    // Filtrar por precio
    resultado = resultado.filter(
      (producto) =>
        producto.precio >= filtrosActivos.precioMin &&
        producto.precio <= filtrosActivos.precioMax
    );

    // Ordenar
    resultado.sort((a, b) => {
      switch (filtrosActivos.ordenar) {
        case "precio-asc":
          return a.precio - b.precio;
        case "precio-desc":
          return b.precio - a.precio;
        case "nombre":
          return a.nombre.localeCompare(b.nombre);
        default:
          return 0;
      }
    });
    return resultado;
  }, [productos, busqueda, filtrosActivos]);

  // Ordenar categorias unicas para el filtro
  const categorias = useMemo(() => {
    return [...new Set(productos.map((p) => p.categoria))];
  }, [productos]);

  // Mostrar Loader Mientras Carga
  if (loading) {
    return (
      <LoaderContainer>
        <LoaderWrapper>
          <Spinner />
          <LoaderText>Cargando Productos...</LoaderText>
        </LoaderWrapper>
      </LoaderContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>BODEGA KUKY +</Title>
        <HeaderControls>
          <SearchBar busqueda={busqueda} setBusqueda={setBusqueda} />
          <FilterButton onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            <FiFilter />
            Filtros
          </FilterButton>
        </HeaderControls>
      </Header>

      <ContentWrapper>
        {mostrarFiltros && (
          <FilterSidebar
            filtrosActivos={filtrosActivos}
            setFiltrosActivos={setFiltrosActivos}
            categorias={categorias}
            onClose={() => setMostrarFiltros(false)}
          />
        )}

        <ProductsSection>
          {productosFiltrados.length > 0 ? (
            <>
              <ResultsInfo>
                {busqueda || filtrosActivos.categoria !== "todas" ? (
                  <span>
                    Se encontraron <strong>{productosFiltrados.length}</strong>{" "}
                    productos
                  </span>
                ) : (
                  <span>
                    Mostrando <strong>{productosFiltrados.length}</strong>{" "}
                    productos
                  </span>
                )}
              </ResultsInfo>
              <ProductGrid>
                {productosFiltrados.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </ProductGrid>
            </>
          ) : (
            <NoResultsContainer>
              <NoResultsEmoji>🔍</NoResultsEmoji>
              <NoResultsMessage>
                No se encontraron productos que coincidan con tu búsqueda.
              </NoResultsMessage>
              <NoResultsSubtext>
                Intenta con otros términos o ajusta los filtros
              </NoResultsSubtext>
            </NoResultsContainer>
          )}
        </ProductsSection>
      </ContentWrapper>
    </Container>
  );
}

// Animaciones
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;
const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Estilos del Loader
const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
`;

const LoaderWrapper = styled.div`
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid ${({ theme }) => theme.text}20;
  border-top: 4px solid ${({ theme }) => theme.primary || "#3498db"};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto 20px;
`;

const LoaderText = styled.p`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
`;

// Estilos principales
const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  font-size: 32px;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  border: 2px solid ${({ theme }) => theme.text}20;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;

  &:hover {
    background: ${({ theme }) => theme.text}10;
    transform: translateY(-2px);
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 20px;
`;

const ProductsSection = styled.div`
  flex: 1;
`;

const ResultsInfo = styled.div`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.text}80;
  font-size: 16px;

  strong {
    color: ${({ theme }) => theme.text};
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const NoResultsContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const NoResultsEmoji = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const NoResultsMessage = styled.div`
  font-size: 20px;
  color: ${({ theme }) => theme.text};
  margin-bottom: 10px;
`;

const NoResultsSubtext = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.text}60;
`;
