import PropTypes from 'prop-types';
import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export function ModalEdicion({ show, handleClose, donacion, onSave }) {
  // Estado inicial vacío para evitar undefined
  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    ciudad: '',
    donativo: '',
    cantidad: '',
    ...donacion // Sobreescribe con los valores de donacion si existen
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:value
    }));
  };

  // Actualiza el estado solo cuando donacion cambia
  useEffect(() => {
    if (donacion) {
      setForm(donacion);
    }
  }, [donacion]);

  const handleSubmit = () => {
    onSave(form);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Donación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              value={form.nombre || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>DNI</Form.Label>
            <Form.Control
              name="dni"
              value={form.dni || ''}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Ciudad</Form.Label>
            <Form.Control
              name="ciudad"
              value={form.ciudad || ''}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Donativo</Form.Label>
            <Form.Control
              name="donativo"
              value={form.donativo || ''}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              name="cantidad"
              value={form.cantidad || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

ModalEdicion.propTypes = {
  show: PropTypes.bool.isRequired,        // Debe ser booleano y obligatorio
  handleClose: PropTypes.func.isRequired, // Debe ser función y obligatorio
  donacion: PropTypes.shape({            // Debe ser un objeto con esta forma
    nombre: PropTypes.string,            // Campo opcional de tipo string
    dni: PropTypes.string,               // Campo opcional de tipo string
    ciudad: PropTypes.string,           // Campo opcional de tipo string
    donativo: PropTypes.string,         // Campo opcional de tipo string
    cantidad: PropTypes.string,        // Campo opcional de tipo string
  }),
  onSave: PropTypes.func.isRequired    // Debe ser función y obligatorio
};
