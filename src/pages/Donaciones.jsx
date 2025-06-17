// Importaciones de librerías y componentes
import styled from "styled-components";
import {
  collection,
  doc,
  query,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";

// SweetAlert2 - Importación simplificada
import Swal from 'sweetalert2';

// Componentes personalizados
import { AddDonacion } from "../components/CRUD/AddDonacion";
import { Donacion } from "../components/CRUD/Donacion";
import { ModalEdicion } from "../components/CRUD/ModalEdicion";

// Autenticación
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// Estilos de Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

export function Donaciones() {
  // Estados del componente
  const [showModal, setShowModal] = useState(false);
  const [selectDonacion, setSelectDonacion] = useState(null);
  const [user, setUser] = useState(null);
  const [donaciones, setDonaciones] = useState([]);

  // Función para mostrar alertas de éxito
  const showSuccessAlert = (title, text) => {
    Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      timer: 3000,
      timerProgressBar: true,
    });
  };

  // Función para mostrar alertas de error
  const showErrorAlert = (title, text) => {
    Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: '#d33',
    });
  };

  // Abrir modal de edición
  const handleEditModal = (donacion) => {
    setSelectDonacion(donacion);
    setShowModal(true);
  };

  // Guardar cambios desde modal
  const handleSaveChanges = async (update) => {
    if (!selectDonacion) return;
    
    try {
      await updateDoc(doc(db, "donaciones", selectDonacion.id), update);
      setShowModal(false);
      setSelectDonacion(null);
      showSuccessAlert('¡Actualizado!', 'La donación ha sido modificada correctamente.');
    } catch (error) {
      console.error('Error updating donation:', error);
      showErrorAlert('Error', 'No se pudo actualizar la donación');
    }
  };

  // Obtener usuario logueado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userFirebase) => {
      setUser(userFirebase);
    });
    return () => unsubscribe();
  }, []);

  // Escuchar cambios en la colección donaciones
  useEffect(() => {
    const q = query(collection(db, "donaciones"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const donacionesArray = [];
      querySnapshot.forEach((doc) => {
        donacionesArray.push({ ...doc.data(), id: doc.id });
      });
      setDonaciones(donacionesArray);
    }, (error) => {
      console.error('Error listening to donations:', error);
      showErrorAlert('Error', 'No se pudieron cargar las donaciones');
    });
    
    return () => unsubscribe();
  }, []);

  // Eliminar donación con confirmación
  const eliminar = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await deleteDoc(doc(db, "donaciones", id));
        showSuccessAlert('¡Eliminado!', 'La donación ha sido eliminada correctamente.');
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
      showErrorAlert('Error', 'No se pudo eliminar la donación');
    }
  };

  // Marcar como completa/incompleta
  const edit = async (donacion) => {
    const newState = !donacion.complete;
    try {
      await updateDoc(doc(db, "donaciones", donacion.id), {
        complete: newState,
      });
      showSuccessAlert(
        'Estado actualizado',
        `La donación ahora está marcada como ${newState ? 'completa' : 'incompleta'}`
      );
    } catch (error) {
      console.error('Error updating donation status:', error);
      showErrorAlert('Error', 'No se pudo cambiar el estado de la donación');
    }
  };

  return (
    <Container>
      <h1>DONACIONES - REALIZADAS</h1>
      <AddDonacion />
      <hr />
      <div className="table-responsive">
        <table className="table table-dark table-striped table-container">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Ciudad</th>
            <th>Donativo</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {donaciones.length > 0 ? (
            donaciones.map((donacion) => (
              <Donacion
                key={donacion.id}
                donacion={donacion}
                eliminar={eliminar}
                edit={edit}
                user={user}
                handleEditModal={handleEditModal}
              />
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No hay donaciones registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {showModal && (
        <ModalEdicion
          show={showModal}
          handleClose={() => {
            setShowModal(false);
            setSelectDonacion(null);
          }}
          donacion={selectDonacion}
          onSave={handleSaveChanges}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  /* estilos aquí */
  height: 100vh;
  padding: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  .table {
    text-align: center;
  }
`;
