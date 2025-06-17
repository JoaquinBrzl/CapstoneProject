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
      imagen:
        "https://alberdisa.vteximg.com.br/arquivos/ids/178889-600-600/siglo-de-oro.png?v=638549163513100000",
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
      imagen:
        "https://www.lafabril.com.ec/wp-content/uploads/2020/10/JollyKV-Almendra-430x540px.png",
      colorFondo: "#1ABC9C", // Verde agua
    },
    {
      id: 3,
      nombre: "Detergente en polvo",
      marca: "floral",
      submarca: "HIT",
      presentacion: "bl x 300 gr",
      precio: "S/ 1.70",
      imagen:
        "https://res.cloudinary.com/riqra/image/upload/v1715796246/sellers/aje-peru/products/mjtnwupjokclf1t8rdee.png",
      colorFondo: "#3498DB", // Azul
    },
    {
      id: 4,
      nombre: "Azúcar rubia",
      marca: "EL GRANELITO",
      presentacion: "bl x 650 gr",
      precio: "S/ 2.60",
      imagen:
        "https://mundoabarrotes.com/wp-content/uploads/2019/09/Azucar-rubia-Dulce-Olmos-50-kg.webp",
      colorFondo: "#2ECC71", // Verde
    },
    // Productos adicionales para el carrusel
    {
      id: 5,
      nombre: "Arroz extra",
      marca: "COSTEÑO",
      presentacion: "bl x 750 gr",
      precio: "S/ 3.50",
      imagen:
        "https://costenoalimentos.com.pe/media/1960/csefXAK0hpQDY0i5H7h43k4YxlaMvUkrSCoYW7fa.png",
      colorFondo: "#E74C3C", // Rojo
    },
    {
      id: 6,
      nombre: "Leche evaporada",
      marca: "GLORIA",
      presentacion: "lt x 400 ml",
      precio: "S/ 4.20",
      imagen:
        "https://peruvianboxofficial.com/cdn/shop/files/C415FED4-9AD8-4E6D-BADC-648AABFE111F.png?v=1705628491",
      colorFondo: "#9B59B6", // Morado
    },
    {
      id: 7,
      nombre: "Trocitos de Atun",
      marca: "FLORIDA",
      presentacion: "la x 140 gr",
      precio: "S/ 4.90",
      imagen: "https://labodega.com.pe/Adminbackend/fotos/producto12223.jpg",
      colorFondo: "#9bc9fd", // Morado
    },
    {
      id: 8,
      nombre: "Lenteja bebé",
      marca: "EL GRANELITO",
      presentacion: "bl x 400 gr",
      precio: "S/ 4.10",
      precioExtra: "c/u",
      imagen:
        "https://maxiahorro.com.pe/wp-content/uploads/2024/12/MERKAT_LENTEJA-500GR.png",
      colorFondo: "#befdcc", // Morado
    },
  ];
  // Hook para controlar el carrusel
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const nextSlide = () => {
    const maxPages = Math.ceil(productos.length / 4) - 1;
    setCurrentIndex((prev) => Math.min(prev + 1, maxPages));
  };

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
      {/* ========== SECCIÓN DE PRODUCTOS: PRECIOS MÁS MASS ========== */}
      <div className="productos-section">
        {/* Título */}
        <div className="titulo-productos">
          <h2>PRECIOS MÁS BAJOS</h2>
        </div>

        {/* Carrusel */}
        <div className="carrusel-container">
          {/* Botón izquierda */}
          <button className="flecha-nav flecha-izq" onClick={prevSlide}>
            ◀
          </button>

          {/* Wrapper y slider */}
          <div className="productos-wrapper">
            <div
              className="productos-slider"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {/* Páginas de productos (grupos de 4) */}
              {Array.from({ length: Math.ceil(productos.length / 4) }).map(
                (_, pageIndex) => (
                  <div className="productos-page" key={pageIndex}>
                    {productos
                      .slice(pageIndex * 4, pageIndex * 4 + 4)
                      .map((producto) => (
                        <div className="producto-card" key={producto.id}>
                          {/* Imagen con fondo */}
                          <div
                            className="producto-circulo"
                            style={{ backgroundColor: producto.colorFondo }}
                          >
                            <img src={producto.imagen} alt={producto.nombre} />
                          </div>

                          {/* Info */}
                          <div className="producto-info">
                            <h3 className="producto-nombre">
                              {producto.nombre}
                            </h3>
                            <p className="producto-marca">{producto.marca}</p>
                            {producto.submarca && (
                              <p className="producto-submarca">
                                {producto.submarca}
                              </p>
                            )}
                            <p className="producto-presentacion">
                              {producto.presentacion}
                            </p>
                            {producto.precioExtra && (
                              <p className="producto-extra">
                                {producto.precioExtra}
                              </p>
                            )}
                          </div>

                          {/* Botón */}
                          <button className="producto-precio-btn">
                            {producto.precio}
                          </button>
                        </div>
                      ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Botón derecha */}
          <button className="flecha-nav flecha-der" onClick={nextSlide}>
            ▶
          </button>
        </div>

        {/* Indicadores */}
        <div className="indicadores">
          {Array.from({ length: Math.ceil(productos.length / 4) }).map(
            (_, index) => (
              <span
                key={index}
                className={`punto ${index === currentIndex ? "activo" : ""}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            )
          )}
        </div>

        {/* Botón final */}
        <div className="boton-final">
          <button
            className="btn-mas-ahorro"
            onClick={() => navigate("/productos")}
          >
            ENCUENTRA MAS AHORRO
          </button>
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
  /* ========== NUEVA SECCIÓN DE PRODUCTOS ========== */
  .productos-section {
    padding: 60px 20px;
    background-color: linear-gradient(135deg, #e8f8f5, #d5f4e6);
    text-align: center;
    .titulo-productos {
      margin-bottom: 50px;
    }
    h2 {
      text-align: center;
      margin-bottom: 1rem;
      font-size: 2.8rem;
      letter-spacing: 3px;
      font-weight: 900;
      color: #0056b3;
    }
  }

  .carrusel-container {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    position: relative;

    .flecha-nav {
      background: #007bff;
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      font-size: 1.2rem;
      border: none;
      cursor: pointer;
      z-index: 2;
      transition: all 0.3s ease;
      &:hover {
        background-color: #0056b3;
        transform: scale(1.1);
      }
    }
  }

  .productos-wrapper {
    overflow: hidden;
    width: 100%;
    flex: 1;
  }

  .productos-slider {
    display: flex;
    transition: transform 0.6s ease-in-out;
    width: 100%;
  }

  .productos-page {
    display: flex;
    flex: 0 0 100%;
    justify-content: space-around;
  }

  .producto-card {
    background: white;
    border-radius: 15px;
    padding: 20px;
    flex: 1;
    max-width: 240px;
    min-width: 200px;
    text-align: center;
    transition: transform 0.3s;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 450px;
    &:hover {
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }
  }

  .producto-circulo {
    width: 100px;
    height: 120px;
    border-radius: 50%;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
    img {
      width: 80px;
      height: 80px;
      object-fit: comtain;
    }
  }
  .producto-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    text-align: center;
    .producto-nombre {
      font-size: 1.2rem;
      font-weight: bold;
      color: #2e86c1;
      margin-bottom: 8px;
      text-transform: uppercase;
      line-height: 1.2;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .producto-marca {
      font-size: 0.95rem;
      font-weight: bold;
      color: #2e86c1;
      margin-bottom: 4px;
      text-transform: uppercase;
      height: 20px;
      display: flex;
      justify-content: center;
    }
    .producto-submarca {
      font-size: 0.95rem;
      font-weight: bold;
      color: #2e86c1;
      margin-bottom: 8px;
      text-transform: uppercase;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .producto-presentacion {
      font-size: 0.85rem;
      color: #7f8c8d;
      margin-bottom: 4px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      .producto-extra {
        font-size: 0.85rem;
        color: #7f8c8d;
        margin: 0 0 20px 0;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  .producto-precio-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 100px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }
  }

  .indicadores {
    margin: 40px 0;
    text-align: center;
  }

  .punto {
    height: 12px;
    width: 12px;
    margin: 0 8px;
    background-color: #bdc3c7;
    border-radius: 50%;
    display: inline-block;
    cursor: pointer;
    transition: all 0.3s ease;
    &.activo {
      background-color: #007bff;
      transform: scale(1.3);
    }
    &:hover {
      background-color: #007bff;
      transform: scale(1.1);
    }
  }

  .boton-final {
    margin-top: 30px;
    text-align: center;

    .btn-mas-ahorro {
      border: none;
      font-size: 1.1rem;
      font-weight: 900;
      text-align: center;
      background: linear-gradient(135deg, #fff239, #ffd100);
      color: #123cf8;
      padding: 15px 40px;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 1px;
      box-shadow: 0 4px 15px rgba(255, 210, 0, 0.3);
      &:hover {
        background: linear-gradient(135deg, #ffd100, #ffc107);
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(255, 210, 0, 0.4);
      }
    }
  }
`;
