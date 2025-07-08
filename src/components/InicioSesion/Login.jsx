import styled from "styled-components";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { InputControl } from "./InputControl";

// Importación de useNavigate de React Router y hooks de React
export function Login() {
  const navigate = useNavigate(); // Hook para redirigir a otra página
  const [values, setValues] = useState({ email: "", password: "" }); // Estado para guardar email y contraseña del formulario
  const [error, setError] = useState(""); // Estado para mostrar errores al usuario
  const [submitButton, setSubmitButton] = useState(false); // Estado para deshabilitar el botón mientras se procesa el login

  // Función que se ejecuta al hacer clic en el botón de login
  const Loguearme = () => {
    // Validación simple: verificar si email y password están completos
    if (!values.email || !values.password) {
      setError("Datos Incompletos"); // Mostrar mensaje de error
      return; // Salir de la función si hay campos vacíos
    }

    setError(""); // Limpiar errores anteriores
    setSubmitButton(true); // Deshabilitar botón mientras se procesa

    // Función de Firebase para iniciar sesión con email y contraseña
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then(async (res) => {
        setSubmitButton(false); // Habilita el botón nuevamente
        navigate("/"); // Redirige a la página principal
      })
      .catch((err) => {
        setSubmitButton(false); // Habilita el botón nuevamente
        setError(err.message); // Muestra el mensaje de error de Firebase
      });
  };

  return (
    // Contenedor principal del login
    <Container>
      <div className="innerBox">
        <h1 className="heading">Login</h1>

        {/* Campo para ingresar el email */}
        <InputControl
          type="email"
          label="Email"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, email: event.target.value }))
          }
          placeholder="Ingresa tu Correo"
        />

        {/* Campo para ingresar la contraseña */}
        <InputControl
          type="password"
          label="Password"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, password: event.target.value }))
          }
          placeholder="Ingresa tu Cotraseña"
        />

        {/* Sección de pie de página: errores, botón y link de registro */}
        <div className="footer">
          <b className="error">{error}</b> {/* Muestra error si existe */}
          <button onClick={Loguearme} disabled={submitButton}>
            Login
          </button>
          <hr />
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
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
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

    .error {
      font-weight: bold;
      font-size: 0%.875rem;
      color: #ff3300;
      text-align: center;
    }

    button {
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
    button:disabled {
      background-color: gray !important;
    }
    button:hover {
      background-color: #7860ff;
    }
    p {
      font-weight: 700;
      color: #161616;
    }
    p span a {
      font-weight: bold;
      color: #4658ff;
      letter-spacing: 1px;
      font-size: 1rem;
      text-decoration: none;
    }
  }
`;
