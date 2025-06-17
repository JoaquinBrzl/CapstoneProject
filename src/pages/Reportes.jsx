import styled from "styled-components";

export function Reportes() {
  return (
    <Container>
      <Title>📊 Reportes Generales - Bodega Kuky</Title>

      <Section>
        <Image src="https://cdn-icons-png.flaticon.com/512/2920/2920341.png" alt="Productos" />
        <TextContent>
          <h2>Productos y Catálogo</h2>
          <p>
            Contamos con un sistema de productos altamente organizado,
            con búsqueda inteligente, filtros por categoría, y ordenamiento.
            Puedes acceder al catálogo completo desde la sección “Productos”.
          </p>
        </TextContent>
      </Section>

      <Section reverse>
        <TextContent>
          <h2>Carrito y Órdenes</h2>
          <p>
            Cada usuario puede agregar productos al carrito, modificar cantidades,
            y generar un PDF con detalles de su orden incluyendo fecha, subtotal,
            descuentos y métodos de pago como Yape, Plin o efectivo.
          </p>
        </TextContent>
        <Image src="https://cdn-icons-png.flaticon.com/512/4290/4290854.png" alt="Carrito" />
      </Section>

      <Section>
        <Image src="https://cdn-icons-png.flaticon.com/512/3330/3330310.png" alt="Donaciones" />
        <TextContent>
          <h2>Donaciones Recibidas</h2>
          <p>
            En la plataforma se visualiza una tabla responsiva de donaciones
            con campos como nombre, DNI, ciudad, tipo de donativo y cantidad.
            Los administradores pueden editar, eliminar o marcar las donaciones
            como completas desde esta vista.
          </p>
        </TextContent>
      </Section>

      <Section reverse>
        <TextContent>
          <h2>Promociones y Portada</h2>
          <p>
            Desde la página principal se presentan productos destacados
            en un carrusel animado, resaltando las promociones más atractivas
            para los clientes y guiándolos directamente al catálogo.
          </p>
        </TextContent>
        <Image src="https://cdn-icons-png.flaticon.com/512/3022/3022076.png" alt="Promociones" />
      </Section>
    </Container>
  );
}

// 🧩 ESTILOS
const Container = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 40px;
  color: ${({ theme }) => theme.text || "#333"};
`;

const Section = styled.div`
  display: flex;
  flex-direction: ${({ reverse }) => (reverse ? "row-reverse" : "row")};
  align-items: center;
  gap: 30px;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Image = styled.img`
  width: 220px;
  height: 220px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 160px;
    height: 160px;
  }
`;

const TextContent = styled.div`
  flex: 1;

  h2 {
    color: ${({ theme }) => theme.primary || "#0056b3"};
    margin-bottom: 10px;
  }

  p {
    color: ${({ theme }) => theme.text || "#555"};
    line-height: 1.6;
    font-size: 16px;
  }
`;
