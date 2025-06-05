import styled from "styled-components";
import { useNavigate } from "react-router-dom";
export function Home() {
  const navigate = useNavigate();
  return (
    <Container>
      <div className="img-container">
        <img
          src="https://s3-us-west-2.amazonaws.com/wp-mpro-blog/wp-content/uploads/2018/10/26105753/Retail-de-supermercado.png"
          alt="Supermercado"
        />
        <div className="text-overlay">
          <h1>¡Bienvenido a la página de inicio!</h1>
          <p>TENEMOS LOS MEJORES PRECIOS CASERO</p>
          <button className="cta-button" onClick={()=>navigate("/productos")}>
            PRODUCTOS
          </button>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  /* estilos aquí */
  height: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  .img-container {
    width: 100%;
    max-width: 100%;
    position: relative; //sirve para el posicionamiento de la imagen
    overflow: hidden;
    img {
      width: 100%;
      height: 100vh;
      max-width: 100%;
      object-fit: cover; //mantiene proporcionado y cubre el area
      display: block;
    }
  }
  /* texto de overlay */
  .text-overlay {
    position: absolute;
    top: 40%; //posicionamiento vertical
    left: 50%; //posicionamiento horizontal
    transform: translate(-50%, -50%); //posicionamiento vertical y horizontal
    text-align: center;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); //Sombra para legitibilidad
    z-index: 1;
    width: 90%;
    max-width: 800px;
    padding: 20px;
    box-sizing: border-box;

    h1 {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;

      /* RESPONSIVE */
      @media (max-width: 768px) {
        font-size: 2rem;
      }
      @media (max-width: 480px) {
        font-size: 1.5rem;
      }
    }
    p {
      font-size: 1.2rem;
      margin: 0 0 2rem 0; //espacio para el boton
      font-weight: bold;
      /* RESPONSIVE */
      @media (max-width: 768px) {
        font-size: 1rem;
        margin-bottom: 1.5rem;
      }

      @media (max-width: 480px) {
        font-size: 0.9rem;
        margin-bottom: 1rem;
      }
    }
    .cta-button {
      background: linear-gradient(125deg, #007bff, #0056b3);
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
      text-transform: uppercase;
      letter-spacing: 1px;
      &:hover {
        transform: translateY(-2px); //animacion para arriba (eje Y)
        box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
        background: linear-gradient(135deg, #0056b3, #004085);
      }
      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 10px rgba(0, 123, 255, 0.3);
      }
      @media (max-width: 768px) {
        padding: 12px 25px;
        font-size: 1rem;
      }

      @media (max-width: 480px) {
        padding: 10px 20px;
        font-size: 0.9rem;
      }
    }
  }
`;
