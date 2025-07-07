// Importaciones principales
import styled from "styled-components";
import logo from "../assets/react.svg";
import { v } from "../styles/Variables"; // Variables de estilo

// Importación de iconos (agrupados por librería)
import { AiOutlineLeft } from "react-icons/ai";
import { MdLogout, MdLogin } from "react-icons/md";
import { BiSolidDonateHeart } from "react-icons/bi";
import { BiSolidReport } from "react-icons/bi";
import { FaShopLock } from "react-icons/fa6";
import {
  FaStore,
  FaHome,
  FaCartPlus,
  FaHandsHelping,
  FaUser,
} from "react-icons/fa";

// Dependencias de React y routing
import { NavLink } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

// Firebase authentication
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

// Contexto del tema
import { themeContext } from "../App";
import { useCart } from "../context/CartContext";

export function Sidebar({ sidebarOpen, setSidebarOpen }) {
  // [1] Estados del componente
  const [user, setUser] = useState(null); // Estado de usuario
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  // [2] Efecto para manejar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe(); // Cleanup al desmontar
  }, []);

  // [3] Handlers principales
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const { setTheme, theme } = useContext(themeContext);
  const toggleTheme = () => setTheme(theme === "Light" ? "Dark" : "Light");

  // Links Array
  const linksArray = [
  { label: "Home", icon: <FaHome />, to: "/" },
  { label: "Tienda", icon: <FaStore />, to: "/productos" },
  {
    label: "Mi Carrito",
    icon: <FaCartPlus />,
    to: "/carrito",
    badge: itemCount
  },
  { label: "Donaciones", icon: <BiSolidDonateHeart />, to: "/donaciones" },
  { label: "Ayudas", icon: <BiSolidReport />, to: "/reportes" },
  { label: "PanelPedidos", icon: <FaShopLock />, to: "/panelPedidos" }
];


  return (
    <Container isOpen={sidebarOpen} themeUse={theme}>
      {/* [A] Botón de toggle del sidebar */}
      <button className="sidebarbutton" onClick={toggleSidebar}>
        <AiOutlineLeft />
      </button>

      {/* [B] Logo y nombre de la app */}
      <div className="logocontent">
        <div className="imgcontent">
          <img src={logo} alt="Logo" />
        </div>
        <h2>KUKY</h2>
      </div>

      {/* [C] Menú principal (mapeo de linksArray) */}
      {linksArray.map(({ icon, label, to, badge }) => (
        <div className="linkContainer" key={label}>
          <NavLink
            to={to}
            className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
          >
            <div className="Linkicon">
              {icon}
              {!sidebarOpen && badge > 0 && <BadgeSmall>{badge}</BadgeSmall>}
            </div>
            <span className={`sidebar-text ${sidebarOpen ? "open" : ""}`}>
              {label}
              {sidebarOpen && badge > 0 && <BadgeLarge>{badge}</BadgeLarge>}
            </span>
          </NavLink>
        </div>
      ))}

      <Divider />

      {/* [D] Sección de usuario (condicional) */}
      {user ? (
        <>
          {/* Info usuario */}
          <div className="linkContainer">
            <div className="Links">
              <div className="Linkicon">
                <FaUser />
              </div>
              <span className={`sidebar-text ${sidebarOpen ? "open" : ""}`}>
                {user.displayName}
              </span>
            </div>
          </div>

          {/* Botón logout */}
          <div className="linkContainer">
            <div className="Links" onClick={() => signOut(auth)}>
              <div className="Linkicon">
                <MdLogout />
              </div>
              <span className={`sidebar-text ${sidebarOpen ? "open" : ""}`}>
                Cerrar Sesión
              </span>
            </div>
          </div>
        </>
      ) : (
        // Botón login
        <div className="linkContainer">
          <NavLink
            to="/login"
            className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
          >
            <div className="Linkicon">
              <MdLogin />
            </div>
            <span className={`sidebar-text ${sidebarOpen ? "open" : ""}`}>
              Iniciar Sesión
            </span>
          </NavLink>
        </div>
      )}

      <Divider />

      {/* [E] Selector de tema */}
      <div className="themecontent">
        {sidebarOpen && <span className="titleTheme">Dark Mode</span>}
        <div className="toggleTheme">
          <div className="grid theme-container">
            <div className="content">
              <div className="demo">
                <label className="switch">
                  <input
                    type="checkbox"
                    className="theme-switcher"
                    onClick={toggleTheme}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
// #endregion

// #region STYLED COMPONENTS
const Container = styled.div`
  /* estilos aquí */
  min-height: 100vh;
  transition: width 0.3s;
  color: ${(props) => props.theme.text};
  background: ${(props) => props.theme.bg};
  padding-top: 20px;
  .sidebarbutton {
    position: absolute;
    top: ${v.xxlSpacing};
    right: -18px;
    height: 32px;
    width: 32px;
    border: none;
    border-radius: 50%;
    background: ${(props) => props.theme.bgtgderecha};
    box-shadow: 0 0 4px ${(props) => props.theme.bg3},
      0 0 7px ${(props) => props.theme.bg};
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;
    transform: ${({ isOpen }) => (isOpen ? `initial` : `rotate(180deg)`)};
    letter-spacing: inherit;
    color: inherit;
    font-size: inherit;
    padding: 0;
    font-family: inherit;
    outline: none;
  }
  .logocontent {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: ${v.lgSpacing};
    .imgcontent {
      display: flex;
      img {
        max-width: 100%;
        height: auto;
      }
      cursor: pointer;
      transition: all 0.3s;
      transform: ${({ isOpen }) => (isOpen ? `scale(1)` : `scale(1.3)`)};
    }
    h2 {
      padding-left: 6px;
      display: ${({ isOpen }) => (!isOpen ? `none` : `block`)};
    }
  }
  .linkContainer {
    margin: 8px 0;
    padding: 0 15%;
    :hover {
      background: ${(props) => props.theme.bg3};
    }
    .Links {
      display: flex;
      align-items: center;
      text-decoration: none;
      padding: calc(${v.smSpacing}-2px) 0;
      color: ${(props) => props.theme.text};
      cursor: pointer;
      .Linkicon {
        padding: ${v.smSpacing} ${v.mdSpacing};
        display: flex;
        position: relative;
        svg {
          font-size: 25px;
        }
      }
      &.active {
        span {
          color: ${(props) => props.theme.bg4};
        }
        .Linkicon {
          svg {
            color: ${(props) => props.theme.bg4};
          }
        }
      }
      .sidebar-text {
        opacity: 0;
        transform: translateX(-10px);
        white-space: nowrap;
        transition: opacity 0.2s ease 0.2s, transform 0.2s ease 0.2s,
          max-width 0.2s ease 0.2s;
        display: inline-block;
        overflow: hidden;
        max-width: 0;
      }
      .sidebar-text.open {
        opacity: 1;
        transform: translateX(0);
        max-width: 190px; /* ajusta según tu diseño */
      }
    }
  }
  .themecontent {
    display: flex;
    align-items: center;
    flex-direction: column;
    .titleTheme {
      display: block;
      padding: 10px;
      font-weight: 700;
      opacity: ${({ isOpen }) => (isOpen ? `1` : `0`)};
      transition: all 0.3s;
      white-space: nowrap;
      overflow: hidden;
    }
    span {
      display: block;
      padding: 10px;
      font-weight: 700;
    }

    .toggleTheme {
      margin: ${({ isOpen }) => (isOpen ? `auto 40px` : `auto 15px`)};
      width: 55px;
      height: 20px;
      border-radius: 10px;
      transition: all 0.3s;
      position: relative;
      .theme-container {
        background-blend-mode: multiply, multiply;
        transition: 0.4s;
        .grid {
          display: grid;
          justify-items: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          font-family: "Lato", sans-serif;
        }
        .demo {
          font-size: 32px;
          .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;

            .theme-switcher {
              opacity: 0;
              width: 0;
              height: 0;
              &:checked + .slider:before {
                left: 4px;
                content: "🌑";
                transform: translateX(26px);
              }
            }
            .slider {
              position: absolute;
              cursor: pointer;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: ${({ themeUse }) =>
                themeUse === "Light" ? v.lightcheckbox : v.checkbox};
              transition: 0.4s;
              &::before {
                position: absolute;
                content: "☀️";
                height: 0px;
                width: 0px;
                left: -10px;
                top: 17px;
                line-height: 0px;
                transition: 0.4s;
              }
              &.round {
                border-radius: 34px;
                &:before {
                  border-radius: 50%;
                }
              }
            }
          }
        }
      }
    }
  }
`;
const BadgeSmall = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const BadgeLarge = styled.span`
  background: #e74c3c;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 10px;
  min-width: 20px;
  text-align: center;
  display: inline-block;
`;
const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${(props) => props.theme.bg3};
  margin: ${v.lgSpacing} 0;
`;
// #endregion
