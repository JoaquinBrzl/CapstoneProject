import styled from "styled-components";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { InputControl } from "./InputControl";

export function Registro() {
  // Hook para redirigir a otra ruta
  const navigate = useNavigate();

  // Estado para guardar los valores del formulario (nombre, email y password)
  const [values, setValues] = useState({ nombre: "", email: "", password: "" });

  // Estado para mostrar errores en caso de campos vacíos o errores de Firebase
  const [error, setError] = useState([]);

  // Estado para deshabilitar el botón mientras se procesa el registro
  const [submitButton, setSubmitButton] = useState(false);

  // Función que se ejecuta al hacer clic en "Registrar"
  const Registrarse = () => {
    // Validación: si falta algún campo, muestra error y detiene el proceso
    if (!values.nombre || !values.email || !values.password) {
      setError(["Se requieren todos los campos"]);
      return;
    }

    // Limpia errores previos y desactiva botón mientras se realiza el registro
    setError("");
    setSubmitButton(true);

    // Firebase Auth: Crear cuenta con correo y contraseña
    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then(async (res) => {
        // Si la creación fue exitosa, reactivar botón
        setSubmitButton(false);

        // Obtener usuario creado
        const user = res.user;

        // Actualizar perfil del usuario con el nombre ingresado
        await updateProfile(user, {
          displayName: values.nombre,
        });

        // Redirige a la página principal luego del registro exitoso
        navigate("/");
      })
      .catch((error) => {
        // Si ocurre un error en el proceso, reactivar botón y mostrar mensaje
        setSubmitButton(false);
        setError([error.message]);
      });
  };

  return (
    <Container>
      <div className="innerBox">
        <h1 className="heading">Registro</h1>

        {/* Campo para ingresar nombre */}
        <InputControl
          type="text"
          label="Name"
          placeholder="Ingrese Nombre"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, nombre: event.target.value }))
          }
        />

        {/* Campo para ingresar correo electrónico */}
        <InputControl
          type="email"
          label="Email"
          placeholder="Ingrese Email"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, email: event.target.value }))
          }
        />

        {/* Campo para ingresar contraseña */}
        <InputControl
          type="password"
          label="Password"
          placeholder="Ingrese Password"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, password: event.target.value }))
          }
        />

        <div className="footer">
          {/* Mostrar errores si los hay */}
          <b className="error">{error}</b>

          {/* Botón para registrar (deshabilitado si se está procesando) */}
          <button onClick={Registrarse} disabled={submitButton}>
            Registrar
          </button>

          <hr />

          {/* Enlace para ir al login si ya tiene una cuenta */}
          <p>
            Tienes ya una cuenta?{" "}
            <span>
              <Link to="/login">Login</Link>
            </span>
          </p>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  /* estilos aquí */
  height: 100%;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(to right, #161616, #3d3939d5);
  display: flex;
  justify-content: center;
  align-items: center;
  .innerBox {
    min-width: 400px;
    height: fit-content;
    width: fit-content;
    background-color: #fff;
    padding: 30px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  .footer {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .footer .error {
    font-weight: bold;
    font-size: 0.875rem;
    text-align: center;
  }
  .footer button {
    outline: none;
    border: none;
    background-color: #759ffc;
    color: #fff;
    border-radius: 5px;
    font-weight: bold;
    font-size: 1rem;
    padding: 10px 16px;
    width: 100%;
    transition: 100ms;
    cursor: pointer;
  }
  .footer button:disabled {
    background-color: gray !important;
  }
  .footer button:hover {
    background-color: #7860ff;
  }
  .footer p {
    font-weight: 700;
    color: #161616;
  }
  .footer p span a {
    font-weight: bold;
    color: #7860ff;
    letter-spacing: 1px;
    font-size: 1rem;
    text-decoration: none;
  }
`;
