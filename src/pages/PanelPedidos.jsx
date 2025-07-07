import styled from "styled-components";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FiTruck, FiHome, FiClock, FiCheck, FiX, FiEye, FiPhone, FiMapPin, FiDollarSign } from "react-icons/fi";
import Swal from "sweetalert2";

export function PanelPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [user, setUser] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userFirebase) => {
      setUser(userFirebase);
      setLoading(false);
      if (!userFirebase) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Escuchar cambios en pedidos en tiempo real
  useEffect(() => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "ventas"),
        orderBy("fecha", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          const pedidosData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setPedidos(pedidosData);
          
          // Reproducir sonido si hay pedidos nuevos no vistos
          const nuevosNoVistos = pedidosData.filter(p => !p.visto && p.estadoPedido === "nuevo");
          if (nuevosNoVistos.length > 0) {
            playNotificationSound();
          }
        } catch (error) {
          console.error("Error procesando pedidos:", error);
        }
      }, (error) => {
        console.error("Error en onSnapshot:", error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error configurando listener:", error);
    }
  }, [user]);

  // Función para reproducir sonido de notificación (mejorada)
  const playNotificationSound = () => {
    try {
      // Crear un beep simple usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("No se pudo reproducir el sonido:", error);
    }
  };

  // Marcar pedido como visto
  const marcarComoVisto = async (pedidoId) => {
    try {
      await updateDoc(doc(db, "ventas", pedidoId), {
        visto: true,
        "timestamps.visto": new Date().toISOString()
      });
    } catch (error) {
      console.error("Error al marcar como visto:", error);
    }
  };

  // Cambiar estado del pedido
  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const updates = {
        estadoPedido: nuevoEstado,
        "timestamps.actualizado": new Date().toISOString()
      };

      if (nuevoEstado === "preparando") {
        updates.preparado = false;
      } else if (nuevoEstado === "listo") {
        updates.preparado = true;
      } else if (nuevoEstado === "entregado") {
        updates.entregado = true;
      }

      await updateDoc(doc(db, "ventas", pedidoId), updates);

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El pedido ahora está: ${nuevoEstado}`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
    }
  };

  // Cambiar estado del pago
  const cambiarEstadoPago = async (pedidoId, nuevoEstado) => {
    try {
      await updateDoc(doc(db, "ventas", pedidoId), {
        estadoPago: nuevoEstado,
        "timestamps.pagado": nuevoEstado === "pagado" ? new Date().toISOString() : null
      });

      Swal.fire({
        icon: 'success',
        title: 'Pago actualizado',
        text: nuevoEstado === "pagado" ? "Pago confirmado" : "Estado de pago actualizado",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error al cambiar estado de pago:", error);
      Swal.fire('Error', 'No se pudo actualizar el pago', 'error');
    }
  };

  // Ver detalles del pedido
  const verDetalles = (pedido) => {
    setSelectedPedido(pedido);
    setShowModal(true);
    if (!pedido.visto) {
      marcarComoVisto(pedido.id);
    }
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtro === "todos") return true;
    if (filtro === "nuevos") return pedido.estadoPedido === "nuevo";
    if (filtro === "preparando") return pedido.estadoPedido === "preparando";
    if (filtro === "listos") return pedido.estadoPedido === "listo";
    return true;
  });

  // Obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "nuevo": return "#e74c3c";
      case "preparando": return "#f39c12";
      case "listo": return "#27ae60";
      case "entregado": return "#95a5a6";
      default: return "#34495e";
    }
  };

  const getEstadoPagoColor = (estado) => {
    switch (estado) {
      case "pendiente": return "#e74c3c";
      case "por-verificar": return "#f39c12";
      case "pagado": return "#27ae60";
      default: return "#34495e";
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <div>Cargando...</div>
      </LoadingContainer>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>Panel de Pedidos</Title>
        <Stats>
          <StatItem color="#e74c3c">
            <span>Nuevos</span>
            <strong>{pedidos.filter(p => p.estadoPedido === "nuevo").length}</strong>
          </StatItem>
          <StatItem color="#f39c12">
            <span>Preparando</span>
            <strong>{pedidos.filter(p => p.estadoPedido === "preparando").length}</strong>
          </StatItem>
          <StatItem color="#27ae60">
            <span>Listos</span>
            <strong>{pedidos.filter(p => p.estadoPedido === "listo").length}</strong>
          </StatItem>
        </Stats>
      </Header>

      <FilterBar>
        <FilterButton active={filtro === "todos"} onClick={() => setFiltro("todos")}>
          Todos ({pedidos.length})
        </FilterButton>
        <FilterButton active={filtro === "nuevos"} onClick={() => setFiltro("nuevos")}>
          Nuevos
        </FilterButton>
        <FilterButton active={filtro === "preparando"} onClick={() => setFiltro("preparando")}>
          Preparando
        </FilterButton>
        <FilterButton active={filtro === "listos"} onClick={() => setFiltro("listos")}>
          Listos
        </FilterButton>
      </FilterBar>

      <PedidosGrid>
        {pedidosFiltrados.map(pedido => (
          <PedidoCard key={pedido.id} nuevo={!pedido.visto}>
            <PedidoHeader>
              <OrderNumber>#{pedido.numeroOrden || pedido.id}</OrderNumber>
              <TipoEntrega tipo={pedido.tipoEntrega}>
                {pedido.tipoEntrega === "delivery" ? <FiTruck /> : <FiHome />}
                {pedido.tipoEntrega === "delivery" ? "Delivery" : "Recojo"}
              </TipoEntrega>
            </PedidoHeader>

            <ClienteInfo>
              <h4>{pedido.cliente?.nombre || "Cliente no especificado"}</h4>
              <p><FiPhone /> {pedido.cliente?.telefono || "No especificado"}</p>
              {pedido.tipoEntrega === "delivery" && (
                <p><FiMapPin /> {pedido.cliente?.direccion || "No especificado"}, {pedido.cliente?.distrito || ""}</p>
              )}
            </ClienteInfo>

            <ProductosResumen>
              <strong>{pedido.cantidadProductos || 0} productos</strong>
              <span> • {pedido.cantidadItems || 0} items</span>
            </ProductosResumen>

            <TotalInfo>
              <FiDollarSign />
              <span>Total: S/ {(pedido.total || 0).toFixed(2)}</span>
            </TotalInfo>

            <EstadosContainer>
              <EstadoBadge color={getEstadoColor(pedido.estadoPedido)}>
                {(pedido.estadoPedido || "nuevo").toUpperCase()}
              </EstadoBadge>
              <EstadoBadge color={getEstadoPagoColor(pedido.estadoPago)}>
                {pedido.estadoPago === "por-verificar" ? "VERIFICANDO" : (pedido.estadoPago || "pendiente").toUpperCase()}
              </EstadoBadge>
            </EstadosContainer>

            <AccionesContainer>
              <AccionButton onClick={() => verDetalles(pedido)}>
                <FiEye /> Ver
              </AccionButton>
              
              {pedido.estadoPedido === "nuevo" && (
                <AccionButton 
                  primary
                  onClick={() => cambiarEstadoPedido(pedido.id, "preparando")}
                >
                  Preparar
                </AccionButton>
              )}
              
              {pedido.estadoPedido === "preparando" && (
                <AccionButton 
                  success
                  onClick={() => cambiarEstadoPedido(pedido.id, "listo")}
                >
                  Listo
                </AccionButton>
              )}
            </AccionesContainer>

            <TimeInfo>
              <FiClock /> {pedido.fecha ? new Date(pedido.fecha).toLocaleString('es-PE') : "Fecha no disponible"}
            </TimeInfo>
          </PedidoCard>
        ))}
      </PedidosGrid>

      {/* Modal de detalles */}
      {showModal && selectedPedido && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Pedido #{selectedPedido.numeroOrden || selectedPedido.id}</h2>
              <CloseButton onClick={() => setShowModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <Section>
                <SectionTitle>Cliente</SectionTitle>
                <p><strong>{selectedPedido.cliente?.nombre || "No especificado"}</strong></p>
                <p>Tel: {selectedPedido.cliente?.telefono || "No especificado"}</p>
                {selectedPedido.tipoEntrega === "delivery" && (
                  <>
                    <p>Dirección: {selectedPedido.cliente?.direccion || "No especificado"}</p>
                    <p>Distrito: {selectedPedido.cliente?.distrito || "No especificado"}</p>
                    {selectedPedido.cliente?.referencia && (
                      <p>Referencia: {selectedPedido.cliente.referencia}</p>
                    )}
                  </>
                )}
              </Section>

              <Section>
                <SectionTitle>Productos</SectionTitle>
                <ProductList>
                  {(selectedPedido.productos || []).map((producto, index) => (
                    <ProductItem key={index}>
                      <span>{producto.nombre} x{producto.cantidad}</span>
                      <span>S/ {(producto.subtotal || 0).toFixed(2)}</span>
                    </ProductItem>
                  ))}
                </ProductList>
                <TotalRow>
                  <strong>Subtotal:</strong>
                  <strong>S/ {(selectedPedido.subtotal || 0).toFixed(2)}</strong>
                </TotalRow>
                {selectedPedido.costoDelivery > 0 && (
                  <TotalRow>
                    <strong>Delivery:</strong>
                    <strong>S/ {selectedPedido.costoDelivery.toFixed(2)}</strong>
                  </TotalRow>
                )}
                <TotalRow final>
                  <strong>Total:</strong>
                  <strong>S/ {(selectedPedido.total || 0).toFixed(2)}</strong>
                </TotalRow>
              </Section>

              <Section>
                <SectionTitle>Información de Pago</SectionTitle>
                <p>Método: <strong>{selectedPedido.metodoPago || "No especificado"}</strong></p>
                <p>Estado: <EstadoBadge small color={getEstadoPagoColor(selectedPedido.estadoPago)}>
                  {selectedPedido.estadoPago || "pendiente"}
                </EstadoBadge></p>
                {selectedPedido.codigoOperacion && (
                  <p>Código: <strong>{selectedPedido.codigoOperacion}</strong></p>
                )}
                {selectedPedido.comprobanteUrl && (
                  <ComprobanteImage 
                    src={selectedPedido.comprobanteUrl} 
                    alt="Comprobante"
                    onClick={() => window.open(selectedPedido.comprobanteUrl, '_blank')}
                  />
                )}
              </Section>

              <AccionesModal>
                {selectedPedido.estadoPago !== "pagado" && (
                  <ModalButton 
                    success
                    onClick={() => cambiarEstadoPago(selectedPedido.id, "pagado")}
                  >
                    Confirmar Pago
                  </ModalButton>
                )}
                {selectedPedido.estadoPedido !== "entregado" && (
                  <ModalButton 
                    primary
                    onClick={() => cambiarEstadoPedido(selectedPedido.id, "entregado")}
                  >
                    Marcar Entregado
                  </ModalButton>
                )}
              </AccionesModal>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

// ESTILOS
const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.text};
  font-size: 28px;
`;

const Stats = styled.div`
  display: flex;
  gap: 20px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 25px;
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.text}10;
  
  span {
    color: ${({ theme }) => theme.text}60;
    font-size: 14px;
  }
  
  strong {
    color: ${({ color }) => color};
    font-size: 28px;
    margin-top: 5px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 10px 20px;
  background: ${({ active, theme }) => active ? theme.primary || "#3498db" : theme.bg};
  color: ${({ active, theme }) => active ? "white" : theme.text};
  border: 1px solid ${({ theme }) => theme.text}20;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  
  &:hover {
    background: ${({ theme }) => theme.primary || "#3498db"};
    color: white;
  }
`;

const PedidosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const PedidoCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.text}10;
  position: relative;
  transition: all 0.3s;
  
  ${({ nuevo }) => nuevo && `
    border: 2px solid #e74c3c;
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
    
    &::before {
      content: "NUEVO";
      position: absolute;
      top: -10px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.text}20;
  }
`;

const PedidoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const OrderNumber = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  margin: 0;
`;

const TipoEntrega = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: ${({ tipo }) => tipo === "delivery" ? "#3498db20" : "#27ae6020"};
  color: ${({ tipo }) => tipo === "delivery" ? "#3498db" : "#27ae60"};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const ClienteInfo = styled.div`
  margin-bottom: 15px;
  
  h4 {
    color: ${({ theme }) => theme.text};
    margin: 0 0 8px 0;
  }
  
  p {
    color: ${({ theme }) => theme.text}80;
    font-size: 14px;
    margin: 4px 0;
    display: flex;
    align-items: center;
    gap: 5px;
    
    svg {
      font-size: 16px;
    }
  }
`;

const ProductosResumen = styled.div`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  margin-bottom: 10px;
  
  span {
    color: ${({ theme }) => theme.text}60;
  }
`;

const TotalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const EstadosContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const EstadoBadge = styled.span`
  padding: ${({ small }) => small ? "4px 10px" : "6px 12px"};
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  border-radius: 20px;
  font-size: ${({ small }) => small ? "12px" : "13px"};
  font-weight: 600;
`;

const AccionesContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const AccionButton = styled.button`
  padding: 8px 16px;
  background: ${({ primary, success, theme }) => 
    primary ? theme.primary || "#3498db" : 
    success ? "#27ae60" : 
    theme.bg2};
  color: ${({ primary, success, theme }) => 
    primary || success ? "white" : theme.text};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const TimeInfo = styled.div`
  color: ${({ theme }) => theme.text}60;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Modal = styled.div`
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
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.text}20;
  
  h2 {
    color: ${({ theme }) => theme.text};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.7;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 25px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.text}20;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.text}80;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.text}10;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: ${({ theme }) => theme.text};
  
  ${({ final }) => final && `
    border-top: 2px solid ${({ theme }) => theme.text}20;
    padding-top: 12px;
    margin-top: 8px;
    font-size: 18px;
  `}
`;

const ComprobanteImage = styled.img`
  width: 100%;
  max-width: 300px;
  margin-top: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const AccionesModal = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.text}20;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 12px 20px;
  background: ${({ primary, success }) => 
    primary ? "#3498db" : 
    success ? "#27ae60" : 
    "#e74c3c"};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;
