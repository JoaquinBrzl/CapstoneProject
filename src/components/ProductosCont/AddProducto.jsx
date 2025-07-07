// ARCHIVO NUEVO: src/components/ProductosCont/AddProducto.jsx
// CREAR ESTE ARCHIVO EN LA CARPETA src/components/ProductosCont/

import styled from "styled-components";
import { useState } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Swal from 'sweetalert2';
import { FiUpload, FiX, FiPackage } from "react-icons/fi";

export function AddProducto({ onClose, onProductAdded }) {
  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    stock: "",
    descuento: "0",
    imagen: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  // Categorías disponibles
  const categorias = [
    "abarrotes",
    "bebidas",
    "limpieza",
    "lacteos",
    "snacks",
    "carnes",
    "frutas",
    "verduras",
    "panaderia",
    "otros"
  ];

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        Swal.fire('Error', 'Por favor sube una imagen válida (JPG, PNG, WEBP)', 'error');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'La imagen no debe superar los 5MB', 'error');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Subir imagen a Firebase Storage
  const uploadImage = async () => {
    if (!imageFile) return "";

    const storageRef = ref(storage, `productos/${Date.now()}_${imageFile.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      throw error;
    }
  };

  // Función para insertar producto
  const insertar = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!producto.nombre || !producto.precio || !producto.categoria || !producto.stock) {
      Swal.fire('Error', 'Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    setLoading(true);

    try {
      // Subir imagen si existe
      let imagenUrl = "";
      if (imageFile) {
        imagenUrl = await uploadImage();
      }

      // Guardar producto en Firestore
      await addDoc(collection(db, "productos"), {
        ...producto,
        precio: parseFloat(producto.precio),
        stock: parseInt(producto.stock),
        descuento: parseInt(producto.descuento) || 0,
        imagen: imagenUrl,
        fechaCreacion: new Date().toISOString()
      });

      // Limpiar formulario
      setProducto({
        nombre: "",
        descripcion: "",
        precio: "",
        categoria: "",
        stock: "",
        descuento: "0",
        imagen: ""
      });
      setImageFile(null);
      setImagePreview("");

      Swal.fire({
        icon: 'success',
        title: '¡Producto agregado!',
        text: 'El producto se ha agregado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      // Callback para actualizar la lista de productos
      if (onProductAdded) {
        onProductAdded();
      }

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error("Error al agregar producto:", error);
      Swal.fire('Error', 'No se pudo agregar el producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <FiPackage /> Agregar Nuevo Producto
        </Title>
        <CloseButton onClick={onClose}>
          <FiX />
        </CloseButton>
      </Header>

      <Form onSubmit={insertar}>
        {/* Nombre del Producto */}
        <InputGroup>
          <Label>Nombre del Producto *</Label>
          <Input
            type="text"
            placeholder="Ej: Aceite Vegetal"
            value={producto.nombre}
            onChange={(e) => setProducto({ ...producto, nombre: e.target.value })}
            required
          />
        </InputGroup>

        {/* Descripción */}
        <InputGroup>
          <Label>Descripción</Label>
          <TextArea
            placeholder="Descripción del producto..."
            value={producto.descripcion}
            onChange={(e) => setProducto({ ...producto, descripcion: e.target.value })}
            rows="3"
          />
        </InputGroup>

        {/* Fila de Precio, Stock y Descuento */}
        <InputRow>
          <InputGroup>
            <Label>Precio (S/) *</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={producto.precio}
              onChange={(e) => setProducto({ ...producto, precio: e.target.value })}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Stock *</Label>
            <Input
              type="number"
              placeholder="0"
              value={producto.stock}
              onChange={(e) => setProducto({ ...producto, stock: e.target.value })}
              required
            />
          </InputGroup>

            <br />

          <InputGroup>
            <Label>Descuento (%)</Label>
            <Input
              type="number"
              placeholder="0"
              min="0"
              max="100"
              value={producto.descuento}
              onChange={(e) => setProducto({ ...producto, descuento: e.target.value })}
            />
          </InputGroup>
        </InputRow>

        {/* Categoría */}
        <InputGroup>
          <Label>Categoría *</Label>
          <Select
            value={producto.categoria}
            onChange={(e) => setProducto({ ...producto, categoria: e.target.value })}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </Select>
        </InputGroup>

        {/* Imagen del Producto - AHORA ABAJO */}
        <InputGroup>
          <Label>Imagen del Producto</Label>
          <ImageUploadArea>
            {imagePreview ? (
              <ImagePreview>
                <img src={imagePreview} alt="Preview" />
                <RemoveImageButton 
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                >
                  <FiX />
                </RemoveImageButton>
              </ImagePreview>
            ) : (
              <UploadPlaceholder htmlFor="image-upload">
                <FiUpload size={40} />
                <p>Arrastra una imagen o haz clic para seleccionar</p>
                <span>JPG, PNG, WEBP (Máx. 5MB)</span>
              </UploadPlaceholder>
            )}
            <HiddenInput
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="image-upload"
            />
          </ImageUploadArea>
        </InputGroup>

        {/* Botones */}
        <ButtonContainer>
          <CancelButton type="button" onClick={onClose}>
            Cancelar
          </CancelButton>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Agregar Producto"}
          </SubmitButton>
        </ButtonContainer>
      </Form>
    </Container>
  );
}

// ESTILOS
const Container = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  box-shadow: 0 10px 40px ${({ theme }) => theme.text}20;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.text}20;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    opacity: 0.7;
  }
`;

const Form = styled.form`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 10px 10px ; 
  border: 1px solid ${({ theme }) => theme.text}30;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary || "#3498db"};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.text}50;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.text}30;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary || "#3498db"};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.text}50;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.text}30;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary || "#3498db"};
  }
`;

const ImageUploadArea = styled.div`
  position: relative;
  width: 100%;
`;

const UploadPlaceholder = styled.label`
  height: 200px;
  border: 2px dashed ${({ theme }) => theme.text}30;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  cursor: pointer;
  background: ${({ theme }) => theme.bg2};
  
  &:hover {
    border-color: ${({ theme }) => theme.primary || "#3498db"};
    background: ${({ theme }) => theme.text}05;
  }
  
  p {
    color: ${({ theme }) => theme.text};
    margin: 0;
    font-weight: 500;
  }
  
  span {
    color: ${({ theme }) => theme.text}60;
    font-size: 12px;
  }
  
  svg {
    color: ${({ theme }) => theme.text}60;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  height: 200px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.bg2};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(231, 76, 60, 0.9);
    transform: scale(1.1);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.text}20;
`;

const CancelButton = styled.button`
  padding: 10px 25px;
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.text}30;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    background: ${({ theme }) => theme.text}10;
    border-color: ${({ theme }) => theme.text}50;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 25px;
  background: ${({ theme }) => theme.primary || "#3498db"};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.primaryHover || "#2980b9"};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.primary || "#3498db"}40;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;