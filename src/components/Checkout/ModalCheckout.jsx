
import styled from "styled-components";
import { useState } from "react";
import { FiX, FiHome, FiTruck, FiCamera, FiDollarSign } from "react-icons/fi";
import Swal from "sweetalert2";

export function ModalCheckout({ show, onClose, onConfirm, total }) {
  const [step, setStep] = useState(1); // 1: tipo entrega, 2: datos, 3: pago
  const [tipoEntrega, setTipoEntrega] = useState(""); // "delivery" o "tienda"
  const [datosCliente, setDatosCliente] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    referencia: "",
    distrito: ""
  });
  const [metodoPago, setMetodoPago] = useState("");
  const [comprobantePago, setComprobantePago] = useState(null);
  const [previewComprobante, setPreviewComprobante] = useState("");
  const [codigoOperacion, setCodigoOperacion] = useState("");

  // Costo de delivery por distrito
  const costosDelivery = {
    "lima-centro": 5,
    "san-isidro": 7,
    "miraflores": 7,
    "surco": 8,
    "la-molina": 10,
    "otros": 12
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'La imagen no debe superar los 5MB', 'error');
        return;
      }

      setComprobantePago(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewComprobante(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calcularTotalConDelivery = () => {
    if (tipoEntrega === "delivery" && datosCliente.distrito) {
      const costoDelivery = costosDelivery[datosCliente.distrito] || costosDelivery.otros;
      return total + costoDelivery;
    }
    return total;
  };

  const validarPaso = () => {
    if (step === 1 && !tipoEntrega) {
      Swal.fire('Error', 'Selecciona un tipo de entrega', 'error');
      return false;
    }

    if (step === 2) {
      if (tipoEntrega === "delivery") {
        if (!datosCliente.nombre || !datosCliente.telefono || !datosCliente.direccion || !datosCliente.distrito) {
          Swal.fire('Error', 'Completa todos los campos obligatorios', 'error');
          return false;
        }
      } else {
        if (!datosCliente.nombre || !datosCliente.telefono) {
          Swal.fire('Error', 'Ingresa tu nombre y teléfono', 'error');
          return false;
        }
      }
    }

    if (step === 3) {
      if (!metodoPago) {
        Swal.fire('Error', 'Selecciona un método de pago', 'error');
        return false;
      }
      
      if (metodoPago !== "efectivo-tienda") {
        if (!comprobantePago && !codigoOperacion) {
          Swal.fire('Error', 'Debes subir el comprobante o ingresar el código de operación', 'error');
          return false;
        }
      }
    }

    return true;
  };

  const siguientePaso = () => {
    if (validarPaso()) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        // Finalizar compra
        const datosVenta = {
          tipoEntrega,
          datosCliente,
          metodoPago,
          comprobantePago,
          codigoOperacion,
          totalConDelivery: calcularTotalConDelivery(),
          costoDelivery: tipoEntrega === "delivery" ? (calcularTotalConDelivery() - total) : 0,
          estadoPago: metodoPago === "efectivo-tienda" ? "pendiente" : "por-verificar",
          estadoPedido: "nuevo"
        };
        onConfirm(datosVenta);
      }
    }
  };

  const pasoAnterior = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!show) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Finalizar Compra</Title>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </Header>

        <ProgressBar>
          <ProgressStep active={step >= 1}>1. Entrega</ProgressStep>
          <ProgressStep active={step >= 2}>2. Datos</ProgressStep>
          <ProgressStep active={step >= 3}>3. Pago</ProgressStep>
        </ProgressBar>

        <Body>
          {/* PASO 1: Tipo de Entrega */}
          {step === 1 && (
            <StepContent>
              <StepTitle>¿Cómo deseas recibir tu pedido?</StepTitle>
              
              <DeliveryOptions>
                <DeliveryOption 
                  selected={tipoEntrega === "delivery"}
                  onClick={() => setTipoEntrega("delivery")}
                >
                  <FiTruck size={40} />
                  <h3>Delivery a domicilio</h3>
                  <p>Recibe en la puerta de tu casa</p>
                  <span>Costo desde S/ 5.00</span>
                </DeliveryOption>

                <DeliveryOption 
                  selected={tipoEntrega === "tienda"}
                  onClick={() => setTipoEntrega("tienda")}
                >
                  <FiHome size={40} />
                  <h3>Recojo en tienda</h3>
                  <p>Retira tu pedido en la bodega</p>
                  <span>¡Sin costo adicional!</span>
                </DeliveryOption>
              </DeliveryOptions>
            </StepContent>
          )}

          {/* PASO 2: Datos del Cliente */}
          {step === 2 && (
            <StepContent>
              <StepTitle>
                {tipoEntrega === "delivery" ? "Datos de entrega" : "Datos para el pedido"}
              </StepTitle>

              <FormGroup>
                <Label>Nombre completo *</Label>
                <Input
                  type="text"
                  value={datosCliente.nombre}
                  onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})}
                  placeholder="Juan Pérez"
                />
              </FormGroup>

              <FormGroup>
                <Label>Teléfono *</Label>
                <Input
                  type="tel"
                  value={datosCliente.telefono}
                  onChange={(e) => setDatosCliente({...datosCliente, telefono: e.target.value})}
                  placeholder="999 999 999"
                />
              </FormGroup>

              {tipoEntrega === "delivery" && (
                <>
                  <FormGroup>
                    <Label>Distrito *</Label>
                    <Select
                      value={datosCliente.distrito}
                      onChange={(e) => setDatosCliente({...datosCliente, distrito: e.target.value})}
                    >
                      <option value="">Selecciona un distrito</option>
                      <option value="lima-centro">Lima Centro (S/ 5)</option>
                      <option value="san-isidro">San Isidro (S/ 7)</option>
                      <option value="miraflores">Miraflores (S/ 7)</option>
                      <option value="surco">Surco (S/ 8)</option>
                      <option value="la-molina">La Molina (S/ 10)</option>
                      <option value="otros">Otros distritos (S/ 12)</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Dirección *</Label>
                    <Input
                      type="text"
                      value={datosCliente.direccion}
                      onChange={(e) => setDatosCliente({...datosCliente, direccion: e.target.value})}
                      placeholder="Av. Principal 123"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Referencia</Label>
                    <Input
                      type="text"
                      value={datosCliente.referencia}
                      onChange={(e) => setDatosCliente({...datosCliente, referencia: e.target.value})}
                      placeholder="Cerca al parque..."
                    />
                  </FormGroup>

                  {datosCliente.distrito && (
                    <DeliveryCost>
                      <span>Costo de delivery:</span>
                      <strong>S/ {costosDelivery[datosCliente.distrito] || costosDelivery.otros}.00</strong>
                    </DeliveryCost>
                  )}
                </>
              )}
            </StepContent>
          )}

          {/* PASO 3: Método de Pago */}
          {step === 3 && (
            <StepContent>
              <StepTitle>Método de pago</StepTitle>

              <PaymentOptions>
                <PaymentOption
                  selected={metodoPago === "yape"}
                  onClick={() => setMetodoPago("yape")}
                >
                  <PaymentIcon>💜</PaymentIcon>
                  <span>Yape</span>
                </PaymentOption>

                <PaymentOption
                  selected={metodoPago === "plin"}
                  onClick={() => setMetodoPago("plin")}
                >
                  <PaymentIcon>💚</PaymentIcon>
                  <span>Plin</span>
                </PaymentOption>

                <PaymentOption
                  selected={metodoPago === "transferencia"}
                  onClick={() => setMetodoPago("transferencia")}
                >
                  <PaymentIcon>🏦</PaymentIcon>
                  <span>Transferencia</span>
                </PaymentOption>

                {tipoEntrega === "tienda" && (
                  <PaymentOption
                    selected={metodoPago === "efectivo-tienda"}
                    onClick={() => setMetodoPago("efectivo-tienda")}
                  >
                    <PaymentIcon>💵</PaymentIcon>
                    <span>Efectivo en tienda</span>
                  </PaymentOption>
                )}
              </PaymentOptions>

              {metodoPago && metodoPago !== "efectivo-tienda" && (
                <PaymentInstructions>
                  <h4>Instrucciones de pago:</h4>
                  {metodoPago === "yape" && (
                    <InstructionBox>
                      <p>1. Abre tu app de Yape</p>
                      <p>2. Escanea el QR o yapea al: <strong>999 888 777</strong></p>
                      <p>3. Monto a pagar: <strong>S/ {calcularTotalConDelivery().toFixed(2)}</strong></p>
                      <QRPlaceholder>[QR Code Aquí]</QRPlaceholder>
                    </InstructionBox>
                  )}
                  
                  {metodoPago === "plin" && (
                    <InstructionBox>
                      <p>1. Abre tu app bancaria</p>
                      <p>2. Busca Plin al número: <strong>999 888 777</strong></p>
                      <p>3. Monto a pagar: <strong>S/ {calcularTotalConDelivery().toFixed(2)}</strong></p>
                    </InstructionBox>
                  )}

                  {metodoPago === "transferencia" && (
                    <InstructionBox>
                      <p><strong>Banco:</strong> BCP</p>
                      <p><strong>Cuenta:</strong> 123-456789-0-12</p>
                      <p><strong>CCI:</strong> 00212300456789012</p>
                      <p><strong>Titular:</strong> Bodega Kuky SAC</p>
                      <p><strong>Monto:</strong> S/ {calcularTotalConDelivery().toFixed(2)}</p>
                    </InstructionBox>
                  )}

                  <FormGroup>
                    <Label>Código de operación</Label>
                    <Input
                      type="text"
                      value={codigoOperacion}
                      onChange={(e) => setCodigoOperacion(e.target.value)}
                      placeholder="Ej: 00123456"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>O sube tu comprobante de pago</Label>
                    <UploadArea>
                      {previewComprobante ? (
                        <PreviewImage>
                          <img src={previewComprobante} alt="Comprobante" />
                          <RemoveButton onClick={() => {
                            setComprobantePago(null);
                            setPreviewComprobante("");
                          }}>
                            <FiX />
                          </RemoveButton>
                        </PreviewImage>
                      ) : (
                        <UploadPlaceholder htmlFor="comprobante-upload">
                          <FiCamera size={30} />
                          <p>Subir captura del pago</p>
                        </UploadPlaceholder>
                      )}
                      <HiddenInput
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        id="comprobante-upload"
                      />
                    </UploadArea>
                  </FormGroup>
                </PaymentInstructions>
              )}
            </StepContent>
          )}
        </Body>

        <Footer>
          <TotalSection>
            <TotalRow>
              <span>Subtotal:</span>
              <span>S/ {total.toFixed(2)}</span>
            </TotalRow>
            {tipoEntrega === "delivery" && datosCliente.distrito && (
              <TotalRow>
                <span>Delivery:</span>
                <span>S/ {(costosDelivery[datosCliente.distrito] || costosDelivery.otros).toFixed(2)}</span>
              </TotalRow>
            )}
            <TotalRow final>
              <strong>Total a pagar:</strong>
              <strong>S/ {calcularTotalConDelivery().toFixed(2)}</strong>
            </TotalRow>
          </TotalSection>

          <ButtonGroup>
            {step > 1 && (
              <BackButton onClick={pasoAnterior}>
                Atrás
              </BackButton>
            )}
            <NextButton onClick={siguientePaso}>
              {step === 3 ? "Confirmar Pedido" : "Siguiente"}
            </NextButton>
          </ButtonGroup>
        </Footer>
      </ModalContent>
    </ModalOverlay>
  );
}

// ESTILOS
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
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
  font-size: 22px;
  margin: 0;
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

const ProgressBar = styled.div`
  display: flex;
  padding: 20px;
  gap: 20px;
  background: ${({ theme }) => theme.bg2};
`;

const ProgressStep = styled.div`
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ active, theme }) => active ? "white" : theme.text + "60"};
  background: ${({ active, theme }) => active ? theme.primary || "#3498db" : theme.bg};
  transition: all 0.3s;
`;

const Body = styled.div`
  padding: 20px;
  min-height: 300px;
`;

const StepContent = styled.div`
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StepTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  font-size: 18px;
`;

const DeliveryOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const DeliveryOption = styled.div`
  border: 2px solid ${({ selected, theme }) => selected ? theme.primary || "#3498db" : theme.text + "20"};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: ${({ selected, theme }) => selected ? (theme.primary || "#3498db") + "10" : theme.bg};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.text}20;
  }
  
  h3 {
    color: ${({ theme }) => theme.text};
    margin: 10px 0 5px;
    font-size: 16px;
  }
  
  p {
    color: ${({ theme }) => theme.text}80;
    font-size: 14px;
    margin: 0 0 10px;
  }
  
  span {
    color: ${({ selected, theme }) => selected ? theme.primary || "#3498db" : theme.text + "60"};
    font-weight: 600;
    font-size: 14px;
  }
  
  svg {
    color: ${({ selected, theme }) => selected ? theme.primary || "#3498db" : theme.text + "60"};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.text}30;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary || "#3498db"};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.text}30;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary || "#3498db"};
  }
`;

const DeliveryCost = styled.div`
  background: ${({ theme }) => theme.primary || "#3498db"}10;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    color: ${({ theme }) => theme.text}80;
  }
  
  strong {
    color: ${({ theme }) => theme.primary || "#3498db"};
    font-size: 18px;
  }
`;

const PaymentOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const PaymentOption = styled.div`
  border: 2px solid ${({ selected, theme }) => selected ? theme.primary || "#3498db" : theme.text + "20"};
  border-radius: 12px;
  padding: 20px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: ${({ selected, theme }) => selected ? (theme.primary || "#3498db") + "10" : theme.bg};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.text}20;
  }
  
  span {
    color: ${({ theme }) => theme.text};
    font-weight: 500;
    font-size: 14px;
  }
`;

const PaymentIcon = styled.div`
  font-size: 30px;
  margin-bottom: 8px;
`;

const PaymentInstructions = styled.div`
  h4 {
    color: ${({ theme }) => theme.text};
    margin-bottom: 15px;
  }
`;

const InstructionBox = styled.div`
  background: ${({ theme }) => theme.bg2};
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  p {
    color: ${({ theme }) => theme.text}80;
    margin-bottom: 8px;
    font-size: 14px;
    
    strong {
      color: ${({ theme }) => theme.text};
    }
  }
`;

const QRPlaceholder = styled.div`
  width: 150px;
  height: 150px;
  background: ${({ theme }) => theme.bg};
  border: 2px dashed ${({ theme }) => theme.text}30;
  margin: 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text}50;
  font-size: 12px;
`;

const UploadArea = styled.div`
  position: relative;
`;

const UploadPlaceholder = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 150px;
  border: 2px dashed ${({ theme }) => theme.text}30;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: ${({ theme }) => theme.bg2};
  
  &:hover {
    border-color: ${({ theme }) => theme.primary || "#3498db"};
    background: ${({ theme }) => theme.text}05;
  }
  
  p {
    color: ${({ theme }) => theme.text}60;
    margin: 0;
  }
  
  svg {
    color: ${({ theme }) => theme.text}40;
  }
`;

const PreviewImage = styled.div`
  position: relative;
  height: 200px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(231, 76, 60, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: rgba(231, 76, 60, 1);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const Footer = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.text}20;
  background: ${({ theme }) => theme.bg2};
`;

const TotalSection = styled.div`
  margin-bottom: 20px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.text}80;
  
  ${({ final }) => final && `
    padding-top: 10px;
    border-top: 1px solid ${({ theme }) => theme.text}20;
    font-size: 18px;
    
    strong {
      color: ${({ theme }) => theme.text};
    }
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
`;

const BackButton = styled.button`
  padding: 12px 30px;
  background: transparent;
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.text}30;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    background: ${({ theme }) => theme.text}10;
  }
`;

const NextButton = styled.button`
  padding: 12px 30px;
  background: ${({ theme }) => theme.primary || "#3498db"};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    background: ${({ theme }) => theme.primaryHover || "#2980b9"};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.primary || "#3498db"}40;
  }
`;