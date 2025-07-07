import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Carrito } from "../pages/Carrito";
import { Productos } from "../pages/Productos";
import { Donaciones } from "../pages/Donaciones";
import { Reportes } from "../pages/Reportes";
import { Login } from "../components/InicioSesion/Login";
import { Registro } from "../components/InicioSesion/Registro";
import { PanelPedidos } from "../pages/PanelPedidos";

export function MyRouters() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/donaciones" element={<Donaciones />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/panelPedidos" element={<PanelPedidos />} />
      </Routes>
  );
}
