// ARCHIVO: src/pages/Carrito.jsx
// REEMPLAZA TODO EL CONTENIDO DEL ARCHIVO CON ESTO:

import React, { useState } from 'react';
import styled from "styled-components";
import { useCart } from "../context/CartContext";
import { FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiFileText } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BiSolidDonateHeart } from "react-icons/bi";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ModalEdicion } from "../components/CRUD/ModalEdicion";
import { ModalCheckout } from "../components/Checkout/ModalCheckout";
import Swal from "sweetalert2";
import { registrarVenta } from "../utils/registrarVenta";

export function Carrito() {
  const { cartItems, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Estados para los modales
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [donacionData, setDonacionData] = useState({
    nombre: "",
    dni: "",
    ciudad: "",
    donativo: "",
    cantidad: "",
  });

  // Función para preparar los datos de donación cuando se abre el modal
  const handleOpenDonationModal = () => {
    const resumenProductos = cartItems
      .map((item) => `${item.nombre} (x${item.cantidad})`)
      .join(", ");

    const cantidadTotal = cartItems.reduce(
      (sum, item) => sum + item.cantidad,
      0
    );

    setDonacionData({
      nombre: "",
      dni: "",
      ciudad: "Lima",
      donativo: resumenProductos,
      cantidad: `${cantidadTotal} unidades`,
    });

    setShowDonationModal(true);
  };

  // Función para guardar la donación
  const handleSaveDonation = async (formData) => {
    try {
      Swal.fire({
        title: "Procesando donación...",
        text: "Por favor espere",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const donacionCompleta = {
        ...formData,
        complete: false,
        fechaDonacion: new Date().toISOString(),
        productos: cartItems,
        valorEstimado: getTotal(),
      };

      await addDoc(collection(db, "donaciones"), donacionCompleta);

      clearCart();
      setShowDonationModal(false);

      Swal.fire({
        icon: "success",
        title: "¡Donación registrada!",
        text: "Gracias por tu generosidad. Tu donación ha sido registrada exitosamente.",
        confirmButtonText: "Ver mis donaciones",
        showCancelButton: true,
        cancelButtonText: "Seguir comprando",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/donaciones");
        } else {
          navigate("/productos");
        }
      });
    } catch (error) {
      console.error("Error al registrar donación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar la donación. Por favor intenta nuevamente.",
      });
    }
  };

  // Función para generar PDF
  const generarPDF = async (datosVenta = null) => {
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío. Agrega productos para generar la orden.");
      return;
    }

    const doc = new jsPDF();

    /* === Definición de colores corporativos === */
    const primaryColor = [51, 51, 51];
    const secondaryColor = [231, 76, 60];
    const lightGray = [245, 245, 245];

    /* === HEADER === */
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 45, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("BODEGA KUKY", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Tu bodega de confianza", 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.text("contacto@bodegakuky.com | Av. Principal 123, Lima", 105, 38, {
      align: "center",
    });

    /* === INFORMACIÓN DE LA ORDEN === */
    doc.setFillColor(...lightGray);
    doc.roundedRect(15, 55, 180, 35, 3, 3, "F");

    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    const ordenNumero = datosVenta?.numeroOrden || `ORD-${Date.now().toString().slice(-8)}`;
    const fecha = new Date().toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const hora = new Date().toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    doc.text(`N° de Orden: ${ordenNumero}`, 25, 65);
    doc.text(`Fecha: ${fecha}`, 25, 72);
    doc.text(`Hora: ${hora}`, 140, 72);
    
    // Agregar información del cliente si existe
    if (datosVenta?.cliente) {
      doc.text(`Cliente: ${datosVenta.cliente.nombre}`, 25, 79);
      doc.text(`Tel: ${datosVenta.cliente.telefono}`, 140, 79);
      
      if (datosVenta.tipoEntrega === "delivery") {
        doc.text(`Dirección: ${datosVenta.cliente.direccion}, ${datosVenta.cliente.distrito}`, 25, 86);
      } else {
        doc.text(`Tipo: RECOJO EN TIENDA`, 25, 86);
      }
    }

    /* === DETALLE DE PRODUCTOS === */
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...secondaryColor);
    doc.text("DETALLE DE PRODUCTOS", 15, 102);

    const tableData = cartItems.map((item) => {
      const precioConDesc =
        item.descuento > 0
          ? item.precio * (1 - item.descuento / 100)
          : item.precio;
      const subtotal = precioConDesc * item.cantidad;

      const precioDisplay =
        item.descuento > 0
          ? `S/ ${precioConDesc.toFixed(2)}\n(${item.descuento}% desc.)`
          : `S/ ${precioConDesc.toFixed(2)}`;

      return [
        item.nombre +
          (item.descripcion ? `\n${item.descripcion.substring(0, 50)}...` : ""),
        item.cantidad.toString(),
        precioDisplay,
        `S/ ${subtotal.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      head: [["Producto", "Cant.", "Precio Unit.", "Subtotal"]],
      body: tableData,
      startY: 108,
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 90, halign: "left" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 35, halign: "right" },
        3: { cellWidth: 35, halign: "right", fontStyle: "bold" },
      },
      alternateRowStyles: { fillColor: lightGray },
      foot: [
        [
          {
            content: "SUBTOTAL:",
            colSpan: 3,
            styles: { halign: "right", fontStyle: "bold" },
          },
          {
            content: `S/ ${getTotal().toFixed(2)}`,
            styles: { fontStyle: "bold", fontSize: 12 },
          },
        ],
      ],
      footStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11,
      },
      margin: { left: 15, right: 15 },

      didDrawPage: function (data) {
        const left = data.settings.margin.left || 15;
        const right = data.settings.margin.right || 15;
        const pageW = doc.internal.pageSize.getWidth();
        const width = data.table?.width ?? pageW - left - right;

        const startY = data.table?.startY ?? data.settings.startY ?? 108;
        const endY = data.cursor?.y ?? startY + 10;

        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.rect(left, startY, width, endY - startY);
      },
    });

    /* === RESUMEN DE LA COMPRA === */
    const finalY = doc.lastAutoTable?.finalY || 150;
    const resumenY = finalY + 15;

    doc.setFillColor(...lightGray);
    doc.roundedRect(120, resumenY, 75, 50, 3, 3, "F");

    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const subtotal = getTotal();
    const delivery = datosVenta?.costoDelivery || 0;
    const totalFinal = datosVenta?.total || subtotal;

    doc.text("Subtotal:", 125, resumenY + 10);
    doc.text(`S/ ${subtotal.toFixed(2)}`, 185, resumenY + 10, {
      align: "right",
    });

    if (datosVenta?.tipoEntrega === "delivery") {
      doc.text("Delivery:", 125, resumenY + 18);
      doc.text(`S/ ${delivery.toFixed(2)}`, 185, resumenY + 18, {
        align: "right",
      });
    }

    doc.setLineWidth(0.5);
    doc.line(125, resumenY + 22, 190, resumenY + 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", 125, resumenY + 32);
    doc.setTextColor(...secondaryColor);
    doc.text(`S/ ${totalFinal.toFixed(2)}`, 185, resumenY + 32, {
      align: "right",
    });

    // Método de pago
    if (datosVenta?.metodoPago) {
      doc.setTextColor(...primaryColor);
      doc.setFontSize(10);
      doc.text("Método:", 125, resumenY + 40);
      doc.text(datosVenta.metodoPago.toUpperCase(), 185, resumenY + 40, {
        align: "right",
      });
    }

    /* === INFORMACIÓN ADICIONAL === */
    const infoY = resumenY + 60;

    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN IMPORTANTE", 15, infoY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);

    // Agregar estado de la venta si se registró
    if (datosVenta) {
      doc.setTextColor(...secondaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("✓ PEDIDO REGISTRADO EN EL SISTEMA", 20, infoY + 8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
    }

    const startY = datosVenta ? infoY + 14 : infoY + 8;
    const infoTexts = datosVenta?.tipoEntrega === "delivery" 
      ? [
          "✓ Tu pedido será entregado en las próximas 2 horas",
          "✓ Te llamaremos antes de salir a entregar",
          "✓ Pago contra entrega disponible",
          "✓ WhatsApp: +51 999 888 777"
        ]
      : [
          "✓ Tu pedido estará listo en 30 minutos",
          "✓ Presentar DNI al recoger",
          "✓ Horario: Lun‑Sáb 8:00‑21:00, Dom 9:00‑14:00",
          "✓ WhatsApp: +51 999 888 777"
        ];
    
    infoTexts.forEach((t, i) => doc.text(t, 20, startY + i * 6));

    /* === ESTADO DEL PEDIDO === */
    if (datosVenta) {
      const estadoY = startY + infoTexts.length * 6 + 10;
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(15, estadoY, 180, 25, 3, 3, "FD");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("ESTADO DEL PEDIDO:", 20, estadoY + 10);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      const estado = datosVenta.estadoPago === "efectivo-tienda" 
        ? "📋 Pendiente de pago en tienda" 
        : "⏳ En verificación de pago";
      
      doc.text(estado, 20, estadoY + 18);
    }

    /* === PIE DE PÁGINA === */
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Gracias por su preferencia", 105, 285, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("BODEGA KUKY - Siempre cerca de ti", 105, 290, {
      align: "center",
    });

    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(2);
    doc.line(80, 293, 130, 293);

    /* === Descargar PDF === */
    doc.save(`Orden_${ordenNumero}_BodegaKuky.pdf`);
  };

  // Función para manejar el checkout
  const handleCheckoutConfirm = async (datosCheckout) => {
    try {
      // Mostrar loading
      Swal.fire({
        title: "Procesando pedido...",
        text: "Por favor espere",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      // Registrar la venta
      const resultadoVenta = await registrarVenta(cartItems, datosCheckout);

      if (resultadoVenta.success) {
        // Generar PDF con los datos de la venta
        await generarPDF(resultadoVenta.data);

        // Limpiar carrito
        clearCart();
        
        // Cerrar modal
        setShowCheckoutModal(false);

        // Mostrar mensaje de éxito según el tipo de pago
        if (datosCheckout.metodoPago === "efectivo-tienda") {
          Swal.fire({
            icon: "success",
            title: "¡Pedido registrado!",
            html: `
              <p><strong>N° de Orden: ${resultadoVenta.numeroOrden}</strong></p>
              <p>Tu pedido estará listo en 30 minutos</p>
              <p>Presenta este código al recoger</p>
            `,
            confirmButtonText: "Entendido",
          });
        } else if (datosCheckout.tipoEntrega === "delivery") {
          Swal.fire({
            icon: "success",
            title: "¡Pedido registrado!",
            html: `
              <p><strong>N° de Orden: ${resultadoVenta.numeroOrden}</strong></p>
              <p>Estamos verificando tu pago</p>
              <p>Te llamaremos para confirmar la entrega</p>
            `,
            confirmButtonText: "Entendido",
          });
        } else {
          Swal.fire({
            icon: "success",
            title: "¡Pedido registrado!",
            html: `
              <p><strong>N° de Orden: ${resultadoVenta.numeroOrden}</strong></p>
              <p>Estamos verificando tu pago</p>
              <p>Tu pedido estará listo en 30 minutos</p>
            `,
            confirmButtonText: "Entendido",
          });
        }

        // Redirigir después de 3 segundos
        setTimeout(() => {
          navigate("/productos");
        }, 3000);

      } else {
        throw new Error(resultadoVenta.error);
      }
    } catch (error) {
      console.error("Error al procesar pedido:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo procesar tu pedido. Por favor intenta nuevamente.",
      });
    }
  };

  // Función para continuar compra
  const handleContinuarCompra = () => {
    if (cartItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "Agrega productos antes de continuar",
      });
      return;
    }

    // Abrir modal de checkout
    setShowCheckoutModal(true);
  };

  /* === RENDER === */
  if (cartItems.length === 0) {
    return (
      <EmptyCartContainer>
        <EmptyCartIcon>
          <FiShoppingCart />
        </EmptyCartIcon>
        <EmptyCartTitle>Tu carrito está vacío</EmptyCartTitle>
        <EmptyCartText>
          ¡Agrega productos para comenzar tu compra!
        </EmptyCartText>
        <ContinueShoppingButton onClick={() => navigate("/productos")}>
          Ir a comprar
        </ContinueShoppingButton>
      </EmptyCartContainer>
    );
  }

  return (
    <>
      <CartContainer>
        <CartContent>
          <CartHeader>
            <CartTitle>Carrito ({cartItems.length} productos)</CartTitle>
            <VendorInfo>
              Vendido por <VendorName>Bodega Kuky</VendorName>
            </VendorInfo>
          </CartHeader>

          <SelectAllContainer>
            <Checkbox type="checkbox" defaultChecked />
            <SelectAllText>Seleccionar todos</SelectAllText>
          </SelectAllContainer>

          <CartItemsList>
            {cartItems.map((item) => (
              <CartItem key={item.id}>
                <ItemCheckbox type="checkbox" defaultChecked />
                <ItemImage
                  src={item.imagen || "https://via.placeholder.com/120"}
                  alt={item.nombre}
                />
                <ItemDetails>
                  <ItemName>{item.nombre}</ItemName>
                  <ItemCategory>{item.categoria?.toUpperCase() || "GENERAL"}</ItemCategory>
                  <ItemDescription>{item.descripcion}</ItemDescription>
                  {item.stock && item.stock < 10 && (
                    <StockWarning>Últimas {item.stock} unidades</StockWarning>
                  )}
                </ItemDetails>
                <ItemPrice>
                  {item.descuento > 0 ? (
                    <>
                      <OriginalPrice>S/ {item.precio.toFixed(2)}</OriginalPrice>
                      <CurrentPrice>
                        S/ {(item.precio * (1 - item.descuento / 100)).toFixed(2)}
                      </CurrentPrice>
                    </>
                  ) : (
                    <CurrentPrice>S/ {item.precio.toFixed(2)}</CurrentPrice>
                  )}
                </ItemPrice>
                
                <QuantityContainer>
                  <QuantityButton
                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                  >
                    <FiMinus />
                  </QuantityButton>
                  <QuantityInput
                    type="number"
                    value={item.cantidad}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value) || 1)
                    }
                    min="1"
                  />
                  <QuantityButton
                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                  >
                    <FiPlus />
                  </QuantityButton>
                  <StockInfo>Máx {item.stock || 99} unidades</StockInfo>
                </QuantityContainer>
                <RemoveButton onClick={() => removeFromCart(item.id)}>
                  <FiTrash2 />
                </RemoveButton>
              </CartItem>
            ))}
          </CartItemsList>
        </CartContent>

        <OrderSummary>
          <SummaryTitle>Resumen de la orden</SummaryTitle>

          <SummaryRow>
            <SummaryLabel>Productos ({cartItems.length})</SummaryLabel>
            <SummaryValue>S/ {getTotal().toFixed(2)}</SummaryValue>
          </SummaryRow>

          <Divider />

          <TotalRow>
            <TotalLabel>Total:</TotalLabel>
            <TotalValue>S/ {getTotal().toFixed(2)}</TotalValue>
          </TotalRow>

          <CheckoutButton onClick={handleContinuarCompra}>
            <FiFileText style={{ marginRight: "8px" }} />
            Completar Compra
          </CheckoutButton>

          <DonateButton onClick={handleOpenDonationModal}>
            <BiSolidDonateHeart style={{ marginRight: "8px" }} />
            Donar estos productos
          </DonateButton>

          <DonateInfo>
            Convierte tu compra en una donación para quienes más lo necesitan
          </DonateInfo>

          <PaymentOptions>
            <YapeOption>
              <YapeIcon>💜</YapeIcon>
              ¡Ahora puedes pagar tus compras con Yape!
            </YapeOption>
          </PaymentOptions>
        </OrderSummary>
      </CartContainer>

      {/* Modal de donación */}
      <ModalEdicion
        show={showDonationModal}
        handleClose={() => setShowDonationModal(false)}
        donacion={donacionData}
        onSave={handleSaveDonation}
      />

      {/* Modal de checkout */}
      <ModalCheckout
        show={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={handleCheckoutConfirm}
        total={getTotal()}
      />
    </>
  );
}

// Estilos
const CartContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const CartContent = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 8px;
  padding: 20px;
`;

const CartHeader = styled.div`
  margin-bottom: 20px;
`;

const CartTitle = styled.h1`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  margin-bottom: 8px;
`;

const VendorInfo = styled.p`
  color: ${({ theme }) => theme.text}60;
  font-size: 14px;
`;

const VendorName = styled.span`
  color: ${({ theme }) => theme.primary || "#3498db"};
  font-weight: 500;
`;

const SelectAllContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 0;
  border-bottom: 1px solid ${({ theme }) => theme.text}20;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ItemCheckbox = styled(Checkbox)`
  flex-shrink: 0;
`;

const SelectAllText = styled.span`
  color: ${({ theme }) => theme.text};
`;

const CartItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

const CartItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px 0;
  border-bottom: 1px solid ${({ theme }) => theme.text}10;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ItemName = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 500;
`;

const ItemCategory = styled.span`
  color: ${({ theme }) => theme.text}60;
  font-size: 12px;
  font-weight: 600;
`;

const ItemDescription = styled.p`
  color: ${({ theme }) => theme.text}80;
  font-size: 14px;
`;

const StockWarning = styled.span`
  color: #e74c3c;
  font-size: 13px;
  font-weight: 500;
`;

const ItemPrice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  min-width: 100px;
`;

const OriginalPrice = styled.span`
  color: ${({ theme }) => theme.text}50;
  text-decoration: line-through;
  font-size: 14px;
`;

const CurrentPrice = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
`;

const QuantityContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const QuantityButton = styled.button`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.text}30;
  color: ${({ theme }) => theme.text};
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.text}10;
  }
`;

const QuantityInput = styled.input`
  width: 60px;
  height: 30px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.text}30;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
`;

const StockInfo = styled.span`
  color: ${({ theme }) => theme.text}60;
  font-size: 12px;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text}60;
  cursor: pointer;
  padding: 5px;

  &:hover {
    color: #e74c3c;
  }
`;

const OrderSummary = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 8px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 20px;
`;

const SummaryTitle = styled.h2`
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  margin-bottom: 20px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const SummaryLabel = styled.span`
  color: ${({ theme }) => theme.text}80;
`;

const SummaryValue = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.text}20;
  margin: 20px 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TotalLabel = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
`;

const TotalValue = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #222;
  }
`;

const DonateButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  box-shadow: 0 4px 6px rgba(39, 174, 96, 0.2);
  
  &:hover {
    background: #219a52;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(39, 174, 96, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(39, 174, 96, 0.2);
  }
`;

const DonateInfo = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.text}60;
  font-size: 13px;
  margin-top: 10px;
  font-style: italic;
`;

const PaymentOptions = styled.div`
  margin-top: 20px;
`;

const YapeOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: ${({ theme }) => theme.text}05;
  border-radius: 8px;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
`;

const YapeIcon = styled.span`
  font-size: 20px;
`;

// Estilos para carrito vacío
const EmptyCartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
`;

const EmptyCartIcon = styled.div`
  font-size: 80px;
  color: ${({ theme }) => theme.text}30;
  margin-bottom: 20px;
`;

const EmptyCartTitle = styled.h2`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  margin-bottom: 10px;
`;

const EmptyCartText = styled.p`
  color: ${({ theme }) => theme.text}60;
  font-size: 16px;
  margin-bottom: 30px;
`;

const ContinueShoppingButton = styled.button`
  padding: 12px 40px;
  background: ${({ theme }) => theme.primary || "#3498db"};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.primaryHover || "#2980b9"};
  }
`;