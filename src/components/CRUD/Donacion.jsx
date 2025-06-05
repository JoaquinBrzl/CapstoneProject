import styled from "styled-components";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

// Componente que representa una fila de donación en una tabla
export function Donacion({ donacion, eliminar, edit, user, handleEditModal }) {
  const handleDelete = () => eliminar(donacion.id);
  return (
    <tr>
      <td>{donacion.nombre}</td>
      <td>{donacion.dni}</td>
      <td>{donacion.ciudad}</td>
      <td>{donacion.donativo}</td>
      <td>{donacion.cantidad}</td>
      <td>{donacion.complete ? "Completada" : "Pendiente"}</td>
      {/* SOLO APARECEN LOS BOTONES SI EL USUARIO ESTA LOGUEADO */}
      <td>
        {user && (
          <div className="btn-group">
            {/* Cambia el estado de la donación */}
            <button
              className="btn btn-warning me-1"
              onClick={() => edit(donacion)}
            >
              Estado
            </button>

            {/* Elimina la donación */}
            <button
              className="btn btn-danger me-1"
              onClick={() => handleDelete(donacion.id)}
            >
              Eliminar
            </button>

            {/* Abre el modal para editar la donación */}
            <button
              className="btn btn-success"
              onClick={() => handleEditModal(donacion)}
            >
              Editar
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

const Container = styled.div`
  /* estilos aquí */
  .btn-group{
    margin-left: 5px;
  }
`;
