import styled from "styled-components";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
export function ProductCard({ producto }) {
  // AQUI IRA LA LOGICA DEL CARRITO DE COMPRAS
  console.log("Agregado al carrito: ", producto);
  // SE MOSTRARA UN ALERT SOLO POR AHORA
  alert(`${producto.nombre} agregado al carrito!`);
  return (
    <Container>
      <ImageContainer>
        <ProductImage
          src={producto.imagen || "https://via.placeholder.com/300"}
          alt={producto.nombre}
        />
        <FavoriteButton>
          <FiHeart />
        </FavoriteButton>
        {producto.descuento > 0 && (
          <DiscountButton>-{producto.descuento}</DiscountButton>
        )}
      </ImageContainer>

      <ProductInfo>
        <ProductoName>{producto.nombre}</ProductoName>
        <ProductoDescription>{producto.descripcion}</ProductoDescription>

        <PriceContainer>
          {producto.descuento > 0 ? (
            <>
              <OldPrice>S/. {producto.precio.toFidex(2)}</OldPrice>
              <Price>
                S/.{" "}
                {(producto.precio * (1 - producto.descuento / 100)).toFixed(2)}
              </Price>
            </>
          ) : (
            <Price>S/. {producto.precio.toFidex(2)}</Price>
          )}
        </PriceContainer>

        <AddToCartButton onclick={agregarAlCarrito}>
          <FiShoppingCart />
          Agregar al Carrito
        </AddToCartButton>
      </ProductInfo>
    </Container>
  );
}

const Container = styled.div`
  /* estilos aquí */
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px ${({theme})=>theme.text}10;
  transition: all 0.3;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px ${({theme})=>theme.text}20;
  }
`;

const ImageContainer = styled.div`
    position: relative;
    width: 100%;
    height: 250px;
    overflow: hidden;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FavoriteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover {
    background: #f0f0f0;
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
`;

const ProductInfo = styled.div`
  padding: 20px;
`;

const ProductName = styled.h3`
  color: ${({ theme }) => theme.text};
  margin: 0 0 10px 0;
  font-size: 18px;
`;

const ProductDescription = styled.p`
  color: ${({ theme }) => theme.text}80;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.4;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const Price = styled.span`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.primary || '#2ecc71'};
`;

const OldPrice = styled.span`
  font-size: 18px;
  color: ${({ theme }) => theme.text}60;
  text-decoration: line-through;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 12px;
  background: ${({ theme }) => theme.primary || '#3498db'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.3s;
  
  &:hover {
    background: ${({ theme }) => theme.primaryHover || '#2980b9'};
  }
`;
