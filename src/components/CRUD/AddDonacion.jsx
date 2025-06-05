import styled from "styled-components";
import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import Swal from 'sweetalert2';

// Componente que permite insertar una nueva donación al sistema.
export function AddDonacion() {
  // Estado local para manejar los datos ingresados por el usuario
  const [donacion, setDonacion] = useState({
    nombre: "",
    dni: "",
    ciudad: "",
    donativo: "",
    cantidad: "",
  });

  // Función que se ejecuta al enviar el formulario
  const insertar = async (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario (recarga la página)

    const { nombre, dni, ciudad, donativo, cantidad } = donacion;

    // Validación simple: todos los campos deben estar llenos
    if (nombre && dni && ciudad && donativo && cantidad) {
      await addDoc(collection(db, "donaciones"), {
        ...donacion, // Incluye todos los datos del formulario
        complete: false, // Campo adicional que indica si la donación ha sido completada
      });

      // Limpiar el formulario después de enviar
      setDonacion({
        nombre: "",
        dni: "",
        ciudad: "",
        donativo: "",
        cantidad: "",
      });
    }
  };

  return (
    <Container>
      <form onSubmit={insertar}>
        <div className="input_container">
          <input
            type="text"
            placeholder="Ingresar Nombre"
            value={donacion.nombre}
            onChange={(e) => setDonacion({ ...donacion, nombre: e.target.value })}
          />
          <input
            type="text"
            placeholder="Ingresar DNI"
            value={donacion.dni}
            onChange={(e) => setDonacion({ ...donacion, dni: e.target.value })}
          />
          <input
            type="text"
            placeholder="Ingresar Ciudad"
            value={donacion.ciudad}
            onChange={(e) => setDonacion({ ...donacion, ciudad: e.target.value })}
          />
          <input
            type="text"
            placeholder="Ingresar Donativo"
            value={donacion.donativo}
            onChange={(e) => setDonacion({ ...donacion, donativo: e.target.value })}
          />
          <input
            type="text"
            placeholder="Ingresar Cantidad"
            value={donacion.cantidad}
            onChange={(e) => setDonacion({ ...donacion, cantidad: e.target.value })}
          />
        </div>
        <div className="btn_container">
          <button className="btn btn-primary">Insertar</button>
        </div>
      </form>
    </Container>
  );
}

// 🎨 Estilos usando styled-components
const Container = styled.div`
  text-align: center;

  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 12px;
    border: 1px solid #555;
    border-radius: 5px;
    background-color: #2c2f33;
    color: #fff;
  }

  &:focus {
    outline: none;
    border-color: #00bcd4;
  }

  .btn {
    padding: 10px 20px;
  }
`;
