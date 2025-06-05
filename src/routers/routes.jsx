import {BrowserRouter,Routes,Route} from "react-router-dom";
import {Home} from "../pages/Home";
import {Estadisticas} from "../pages/Estadisticas";
import {Productos} from "../pages/Productos";
import {Donaciones} from "../pages/Donaciones";
import {Reportes} from "../pages/Reportes";
import {Login} from "../components/InicioSesion/Login";
import {Registro} from "../components/InicioSesion/Registro";


export function MyRouters() {
  return (
    <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/productos" element={<Productos />}/>
        <Route path="/estadisticas" element={<Estadisticas />}/>
        <Route path="/donaciones" element={<Donaciones />}/>
        <Route path="/reportes" element={<Reportes />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/registro" element={<Registro />}/>
    </Routes>
  );
}
