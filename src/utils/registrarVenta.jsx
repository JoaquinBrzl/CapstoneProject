// ARCHIVO: src/utils/registrarVenta.js
// ACTUALIZAR ESTE ARCHIVO EN LA CARPETA src/utils/

import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

export const registrarVenta = async (cartItems, datosVenta) => {
  try {
    // Subir comprobante si existe
    let comprobanteUrl = "";
    if (datosVenta.comprobantePago) {
      const storageRef = ref(storage, `comprobantes/${Date.now()}_${datosVenta.comprobantePago.name}`);
      const snapshot = await uploadBytes(storageRef, datosVenta.comprobantePago);
      comprobanteUrl = await getDownloadURL(snapshot.ref);
    }

    // Preparar datos de la venta
    const ventaData = {
      // Información básica
      fecha: new Date().toISOString(),
      numeroOrden: `ORD-${Date.now().toString().slice(-8)}`,
      
      // Totales
      subtotal: datosVenta.totalConDelivery - (datosVenta.costoDelivery || 0),
      costoDelivery: datosVenta.costoDelivery || 0,
      total: datosVenta.totalConDelivery,
      
      // Tipo de entrega
      tipoEntrega: datosVenta.tipoEntrega,
      
      // Datos del cliente
      cliente: {
        nombre: datosVenta.datosCliente.nombre,
        telefono: datosVenta.datosCliente.telefono,
        direccion: datosVenta.datosCliente.direccion || "",
        distrito: datosVenta.datosCliente.distrito || "",
        referencia: datosVenta.datosCliente.referencia || ""
      },
      
      // Información de pago
      metodoPago: datosVenta.metodoPago,
      estadoPago: datosVenta.estadoPago,
      codigoOperacion: datosVenta.codigoOperacion || "",
      comprobanteUrl: comprobanteUrl,
      
      // Estado del pedido
      estadoPedido: datosVenta.estadoPedido || "nuevo",
      
      // Detalles de productos
      productos: cartItems.map(item => ({
        id: item.id,
        nombre: item.nombre,
        categoria: item.categoria || "otros",
        cantidad: item.cantidad,
        precioUnitario: item.descuento > 0 
          ? item.precio * (1 - item.descuento / 100)
          : item.precio,
        precioOriginal: item.precio,
        descuento: item.descuento || 0,
        subtotal: (item.descuento > 0 
          ? item.precio * (1 - item.descuento / 100)
          : item.precio) * item.cantidad
      })),
      
      // Información adicional
      cantidadProductos: cartItems.reduce((sum, item) => sum + item.cantidad, 0),
      cantidadItems: cartItems.length,
      
      // Timestamps para reportes
      año: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      dia: new Date().getDate(),
      hora: new Date().getHours(),
      minutos: new Date().getMinutes(),
      mesAño: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      fechaSimple: new Date().toLocaleDateString('es-PE'),
      
      // Para el panel de administración
      visto: false,
      preparado: false,
      entregado: false,
      
      // Timestamps de cambios de estado
      timestamps: {
        creado: new Date().toISOString(),
        actualizado: new Date().toISOString()
      }
    };

    // Guardar en Firebase
    const docRef = await addDoc(collection(db, "ventas"), ventaData);
    
    return {
      success: true,
      ventaId: docRef.id,
      numeroOrden: ventaData.numeroOrden,
      data: ventaData
    };
    
  } catch (error) {
    console.error("Error al registrar venta:", error);
    return {
      success: false,
      error: error.message
    };
  }
};