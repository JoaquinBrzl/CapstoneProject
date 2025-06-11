import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Array con productos típicos de una bodega peruana
const productosIniciales = [
  // ABARROTES
  {
    nombre: "Arroz Costeño 5kg",
    descripcion: "Arroz extra de grano largo, bolsa de 5 kilos",
    precio: 22.50,
    categoria: "abarrotes",
    imagen: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    descuento: 0,
    stock: 50
  },
  {
    nombre: "Aceite Primor 1L",
    descripcion: "Aceite vegetal premium de 1 litro",
    precio: 8.90,
    categoria: "abarrotes",
    imagen: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5",
    descuento: 5,
    stock: 40
  },
  {
    nombre: "Azúcar Rubia Cartavio 1kg",
    descripcion: "Azúcar rubia refinada, bolsa de 1 kilo",
    precio: 4.20,
    categoria: "abarrotes",
    imagen: "https://images.unsplash.com/photo-1587536849024-daaa4a417b16",
    descuento: 0,
    stock: 60
  },
  {
    nombre: "Leche Gloria Lata 400g",
    descripcion: "Leche evaporada entera, lata de 400 gramos",
    precio: 3.80,
    categoria: "lacteos",
    imagen: "https://images.unsplash.com/photo-1563636619-e9143da7973b",
    descuento: 10,
    stock: 80
  },
  {
    nombre: "Fideos Lavaggi Tallarin 500g",
    descripcion: "Fideos tallarin de trigo, paquete de 500 gramos",
    precio: 2.50,
    categoria: "abarrotes",
    imagen: "https://images.unsplash.com/photo-1551462147-ff29053bfc14",
    descuento: 0,
    stock: 70
  },
  
  // BEBIDAS
  {
    nombre: "Inca Kola 2L",
    descripcion: "Gaseosa sabor original, botella de 2 litros",
    precio: 6.50,
    categoria: "bebidas",
    imagen: "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49",
    descuento: 15,
    stock: 45
  },
  {
    nombre: "Coca Cola 600ml",
    descripcion: "Gaseosa sabor original, botella personal",
    precio: 2.50,
    categoria: "bebidas",
    imagen: "https://images.unsplash.com/photo-1554866585-cd94860890b7",
    descuento: 0,
    stock: 100
  },
  {
    nombre: "Agua San Luis 2.5L",
    descripcion: "Agua mineral sin gas, bidón de 2.5 litros",
    precio: 3.00,
    categoria: "bebidas",
    imagen: "https://images.unsplash.com/photo-1560023907-5f339617ea55",
    descuento: 0,
    stock: 60
  },
  {
    nombre: "Pilsen Callao Six Pack",
    descripcion: "Cerveza en lata, paquete de 6 unidades de 355ml",
    precio: 23.90,
    categoria: "bebidas",
    imagen: "https://images.unsplash.com/photo-1608270586620-248524c67de9",
    descuento: 20,
    stock: 30
  },
  
  // LIMPIEZA
  {
    nombre: "Detergente Ariel 850g",
    descripcion: "Detergente en polvo para ropa, bolsa de 850 gramos",
    precio: 12.90,
    categoria: "limpieza",
    imagen: "https://images.unsplash.com/photo-1563453392212-326f5e854473",
    descuento: 0,
    stock: 35
  },
  {
    nombre: "Papel Higiénico Elite 4 rollos",
    descripcion: "Papel higiénico doble hoja, paquete de 4 unidades",
    precio: 7.50,
    categoria: "limpieza",
    imagen: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a",
    descuento: 10,
    stock: 50
  },
  {
    nombre: "Lejía Clorox 1L",
    descripcion: "Lejía desinfectante tradicional de 1 litro",
    precio: 4.50,
    categoria: "limpieza",
    imagen: "https://images.unsplash.com/photo-1563453392212-326f5e854473",
    descuento: 0,
    stock: 40
  },
  
  // CUIDADO PERSONAL
  {
    nombre: "Jabón Camay Pack x3",
    descripcion: "Jabón de tocador clásico, paquete de 3 unidades",
    precio: 6.90,
    categoria: "cuidado-personal",
    imagen: "https://images.unsplash.com/photo-1601960700875-c8a9c0d8d2b4",
    descuento: 5,
    stock: 45
  },
  {
    nombre: "Shampoo Head & Shoulders 375ml",
    descripcion: "Shampoo anticaspa, frasco de 375ml",
    precio: 18.90,
    categoria: "cuidado-personal",
    imagen: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d",
    descuento: 15,
    stock: 25
  },
  {
    nombre: "Pasta Dental Colgate Triple Acción",
    descripcion: "Pasta dental con flúor, tubo de 150ml",
    precio: 5.50,
    categoria: "cuidado-personal",
    imagen: "https://images.unsplash.com/photo-1559056199-5a47f60c5053",
    descuento: 0,
    stock: 55
  },
  
  // SNACKS Y GOLOSINAS
  {
    nombre: "Galletas Field Vainilla",
    descripcion: "Galletas dulces sabor vainilla, paquete de 250g",
    precio: 3.20,
    categoria: "snacks",
    imagen: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35",
    descuento: 0,
    stock: 70
  },
  {
    nombre: "Papas Lays Clásicas 142g",
    descripcion: "Papas fritas sabor natural, bolsa grande",
    precio: 6.90,
    categoria: "snacks",
    imagen: "https://images.unsplash.com/photo-1566478989037-eec170784d0b",
    descuento: 10,
    stock: 40
  },
  {
    nombre: "Sublime Clásico",
    descripcion: "Chocolate con maní, tableta de 30g",
    precio: 1.50,
    categoria: "snacks",
    imagen: "https://images.unsplash.com/photo-1511381939415-e44015466834",
    descuento: 0,
    stock: 100
  },
  
  // PRODUCTOS FRESCOS
  {
    nombre: "Huevos La Calera x15",
    descripcion: "Huevos frescos de gallina, bandeja de 15 unidades",
    precio: 11.50,
    categoria: "frescos",
    imagen: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f",
    descuento: 0,
    stock: 30
  },
  {
    nombre: "Pan Francés x5",
    descripcion: "Pan francés fresco del día, bolsa de 5 unidades",
    precio: 1.00,
    categoria: "frescos",
    imagen: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73",
    descuento: 0,
    stock: 50
  }
];

// FUNCION PARA CARGAR TODOS LOS PRODUCTOS
export const cargarProductosIniciales = async () => {
    try{
        console.log("Cargando productos iniciales...");

        for(const producto of productosIniciales){
            await addDoc(collection(db, 'productos'),{
                ...producto,
                fechaCreacion: new Date(),
                fechaActualizacion: new Date()
            });
            console.log('Producto Agregado: ', producto.nombre);
        }
        console.log('Productos Agregados con Exito!');
        return true;
    }catch(error){
        console.error('Error al cargar productos: ', error);
        return false;
    }
}