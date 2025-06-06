import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Home() {
  const navigate = useNavigate();

  // Productos en Array
  const productos = [
    {
      id: 1,
      nombre: "Aceite Vegetal",
      marca: "Siglo de Oro",
      presentacion: "bt x 900 ml",
      precio: "S/ 5.90",
      imagen: "https://alberdisa.vteximg.com.br/arquivos/ids/178889-600-600/siglo-de-oro.png?v=638549163513100000",
      colorFondo: "#F1C40F", // Amarillo
    },
    {
      id: 2,
      nombre: "Jabón antibacterial",
      marca: "avena / sabila",
      submarca: "JOLLY",
      presentacion: "pq x 100 gr",
      precio: "S/ 1.80",
      precioExtra: "c/u",
      imagen: "https://www.lafabril.com.ec/wp-content/uploads/2020/10/JollyKV-Almendra-430x540px.png",
      colorFondo: "#1ABC9C", // Verde agua
    },
    {
      id: 3,
      nombre: "Detergente en polvo",
      marca: "floral",
      submarca: "HIT",
      presentacion: "bl x 300 gr",
      precio: "S/ 1.70",
      imagen: "https://res.cloudinary.com/riqra/image/upload/v1715796246/sellers/aje-peru/products/mjtnwupjokclf1t8rdee.png",
      colorFondo: "#3498DB", // Azul
    },
    {
      id: 4,
      nombre: "Azúcar rubia",
      marca: "EL GRANELITO",
      presentacion: "bl x 650 gr",
      precio: "S/ 2.60",
      imagen: "https://mundoabarrotes.com/wp-content/uploads/2019/09/Azucar-rubia-Dulce-Olmos-50-kg.webp",
      colorFondo: "#2ECC71", // Verde
    },
    // Productos adicionales para el carrusel
    {
      id: 5,
      nombre: "Arroz extra",
      marca: "COSTEÑO",
      presentacion: "bl x 750 gr",
      precio: "S/ 3.50",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi9YEzlTaDTRJ-aEvesaAx9ShkcUxNJluctg&s",
      colorFondo: "#E74C3C", // Rojo
    },
    {
      id: 6,
      nombre: "Leche evaporada",
      marca: "GLORIA",
      presentacion: "lt x 400 ml",
      precio: "S/ 4.20",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxjaTRyRmHS3LWQ1a5phx9FTGL3i6LkU9HUw&s",
      colorFondo: "#9B59B6", // Morado
    },
  ];
  // Hook para controlar el carrusel
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <Container>
      {/* ========== SECCIÓN 1: TU IMAGEN HERO ORIGINAL ========== */}
      <div className="hero-section">
        <div className="img-container">
          <img
            src="https://s3-us-west-2.amazonaws.com/wp-mpro-blog/wp-content/uploads/2018/10/26105753/Retail-de-supermercado.png"
            alt="Supermercado"
          />
          <div className="text-overlay">
            <h1>¡Bienvenido a la página de inicio!</h1>
            <p>TENEMOS LOS MEJORES PRECIOS CASERO</p>
            <button
              className="cta-button"
              onClick={() => navigate("/productos")}
            >
              PRODUCTOS
            </button>
          </div>
        </div>
      </div>
      {/* ========== SECCIÓN 2: NUEVA SECCIÓN DE PRODUCTOS ========== */}
      <div className="productos-section">
        {/* Titulo de la seccion */}
        <div className="titulo-productos">
          <h2>Nuestros productos</h2>
        </div>
        {/* Contenedor del carrusel */}
        <div className="carrusel-container">
          {/* flecha izquierda */}
          <button className="flecha-nav flecha-izq">◀</button>
          {/* Productos del carrusel */}
          <div className="productos-wrapper">
            {productos.slice(0, 4).map((producto) => (
              <div className="producto-card" key={producto.id}>
                {/* Circulo color de imageb */}
                <div
                  className="producto-circulo"
                  style={{ backgroundColor: producto.colorFondo }}
                >
                  {/* Imagen del producto */}
                  <img src={producto.imagen} alt={producto.nombre} />
                </div>
                {/* Informacion del producto */}
                <div className="producto-info">
                  <h3 className="producto-nombre">{producto.nombre}</h3>
                  <p className="producto-marca">{producto.marca}</p>
                  {producto.submarca && (
                    <p className="producto-submarca">{producto.submarca}</p>
                  )}
                  <p className="producto-presentacion">
                    {producto.presentacion}
                  </p>
                  {producto.precioExtra && (
                    <p className="producto-extra">{producto.precioExtra}</p>
                  )}
                </div>
                {/* Boton de comprar */}
                <button className="producto-precio-btn">
                  {producto.precio}
                </button>
              </div>
            ))}
          </div>
          {/* flecha derecha */}
          <button className="flecha-nav flecha-der">▶</button>
        </div>
        {/* Indicadores Puntos */}
        <div className="indicadores">
          {[...Array(Math.ceil(productos.length / 4))].map((_, index) => (
            <span
              key={index}
              className={`punto ${index === currentIndex ? "activo" : ""}`}
            ></span>
          ))}
        </div>

        {/* Botón final */}
        <div className="boton-final">
          <button className="btn-mas-ahorro">ENCUENTRA MÁS AHORRO AQUÍ</button>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  /* estilos aquí */
  width: 100%;
  .hero-section {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
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
  /* Nueva seccion de productos */
  .productos-section {
    padding: 60px 20px;
    background: linear-gradient(135deg, #e8f8f5, #d5f4e6);
    text-align: center;
    .titulo-productos {
      margin-bottom: 40px;
      h2 {
        font-size: 2.8rem;
        font-weight: 900;
        color: #1a1a1a;
        text-transform: uppercase;
        letter-spacing: 3px;
        margin: 0;
      }
    }
    .carrusel-container{
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
    }
    .flecha-nav{
      background: #2E86C1;
      color: white;
      border: none;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

      &:hover{
        background: #1F5F99;
        transform: scale(1.1);
      }
    }
    .productos-wrapper{
      display: flex;
      gap: 30px;
      flex: 1;
      justify-content: center;
      overflow: hidden;
    }
    .producto-card{
      text-align: center;
      flex: 0 0 250px;

      .producto-circulo{
        width: 160px;
        height: 160px;
        border-radius: 50%;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }
      img{
        width: 80px;
        height: 80px;
        object-fit: contain;
      }
    }
    .producto-info{
      margin-bottom: 20px;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .producto-nombre{
      font-size: 1rem;
      font-weight: bold;
      color:#2E86C1;
      margin-bottom:8px;
      text-transform: uppercase;
    }
    .producto-marca{
      font-size: 1rem;
      font-weight: bold;
      color:#2E86C1;
      margin-bottom:4px;
      text-transform: uppercase;
    }
  }
`;
