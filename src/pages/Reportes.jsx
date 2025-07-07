
import styled from "styled-components";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { FiTrendingUp, FiDollarSign, FiPackage, FiCalendar, FiDownload } from "react-icons/fi";

export function Reportes() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("mes"); // día, semana, mes, año
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Colores para los gráficos
  const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'];

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userFirebase) => {
      setUser(userFirebase);
      if (!userFirebase) {
        // Si no está logueado, redirigir al login
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Solo cargar datos si el usuario está logueado
    if (user) {
      // Establecer fecha por defecto (último mes)
      const hoy = new Date();
      const hace30Dias = new Date();
      hace30Dias.setDate(hoy.getDate() - 30);
      
      setFechaInicio(hace30Dias.toISOString().split('T')[0]);
      setFechaFin(hoy.toISOString().split('T')[0]);
      
      cargarVentas();
    }
  }, [user]);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const ventasRef = collection(db, "ventas");
      const q = query(ventasRef, orderBy("fecha", "desc"));
      const snapshot = await getDocs(q);
      
      const ventasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setVentas(ventasData);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      setLoading(false);
    }
  };

  // Filtrar ventas por fecha
  const ventasFiltradas = ventas.filter(venta => {
    const fechaVenta = new Date(venta.fecha);
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date(0);
    const fin = fechaFin ? new Date(fechaFin + 'T23:59:59') : new Date();
    
    return fechaVenta >= inicio && fechaVenta <= fin;
  });

  // Calcular estadísticas
  const estadisticas = {
    totalVentas: ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0),
    numeroVentas: ventasFiltradas.length,
    promedioVenta: ventasFiltradas.length > 0 
      ? ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0) / ventasFiltradas.length 
      : 0,
    productosTotales: ventasFiltradas.reduce((sum, venta) => sum + venta.cantidadProductos, 0)
  };

  // Datos para gráfico de líneas (ventas por día)
  const ventasPorDia = () => {
    const groupedData = {};
    
    ventasFiltradas.forEach(venta => {
      const fecha = new Date(venta.fecha).toLocaleDateString('es-PE');
      if (!groupedData[fecha]) {
        groupedData[fecha] = { fecha, ventas: 0, total: 0 };
      }
      groupedData[fecha].ventas += 1;
      groupedData[fecha].total += venta.total;
    });
    
    return Object.values(groupedData).sort((a, b) => 
      new Date(a.fecha.split('/').reverse().join('-')) - 
      new Date(b.fecha.split('/').reverse().join('-'))
    );
  };

  // Datos para gráfico de barras (productos más vendidos)
  const productosMasVendidos = () => {
    const productos = {};
    
    ventasFiltradas.forEach(venta => {
      venta.productos.forEach(producto => {
        if (!productos[producto.nombre]) {
          productos[producto.nombre] = { nombre: producto.nombre, cantidad: 0, ingresos: 0 };
        }
        productos[producto.nombre].cantidad += producto.cantidad;
        productos[producto.nombre].ingresos += producto.subtotal;
      });
    });
    
    return Object.values(productos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  };

  // Datos para gráfico circular (categorías)
  const ventasPorCategoria = () => {
    const categorias = {};
    
    ventasFiltradas.forEach(venta => {
      venta.productos.forEach(producto => {
        const cat = producto.categoria || 'otros';
        if (!categorias[cat]) {
          categorias[cat] = { name: cat, value: 0 };
        }
        categorias[cat].value += producto.subtotal;
      });
    });
    
    return Object.values(categorias);
  };

  // Datos para gráfico de área (métodos de pago)
  const metodosPago = () => {
    const metodos = {};
    
    ventasFiltradas.forEach(venta => {
      const metodo = venta.metodoPago || 'efectivo';
      if (!metodos[metodo]) {
        metodos[metodo] = { metodo, cantidad: 0, total: 0 };
      }
      metodos[metodo].cantidad += 1;
      metodos[metodo].total += venta.total;
    });
    
    return Object.values(metodos);
  };

  // Función para exportar datos
  const exportarDatos = () => {
    const datosExportar = ventasFiltradas.map(venta => ({
      fecha: new Date(venta.fecha).toLocaleString('es-PE'),
      total: venta.total,
      productos: venta.cantidadProductos,
      metodoPago: venta.metodoPago,
      items: venta.productos.map(p => `${p.nombre} x${p.cantidad}`).join(', ')
    }));
    
    const csv = [
      ['Fecha', 'Total', 'Cantidad Productos', 'Método de Pago', 'Detalle'],
      ...datosExportar.map(d => [d.fecha, d.total, d.productos, d.metodoPago, d.items])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_${fechaInicio}_${fechaFin}.csv`;
    a.click();
  };

  // Si el usuario no está logueado, mostrar mensaje
  if (!user) {
    return (
      <NoAccessContainer>
        <NoAccessIcon>🔒</NoAccessIcon>
        <NoAccessTitle>Acceso Restringido</NoAccessTitle>
        <NoAccessText>
          Debes iniciar sesión para ver las estadísticas de ventas
        </NoAccessText>
        <LoginButton onClick={() => navigate("/login")}>
          Iniciar Sesión
        </LoginButton>
      </NoAccessContainer>
    );
  }

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>Cargando estadísticas...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>📊 Estadísticas de Ventas</Title>
        <ExportButton onClick={exportarDatos}>
          <FiDownload /> Exportar CSV
        </ExportButton>
      </Header>

      {/* Filtros de fecha */}
      <FilterSection>
        <FilterGroup>
          <Label>Desde:</Label>
          <DateInput
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </FilterGroup>
        <FilterGroup>
          <Label>Hasta:</Label>
          <DateInput
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </FilterGroup>
        <FilterButtons>
          <FilterButton 
            active={filtroActivo === 'dia'} 
            onClick={() => {
              setFiltroActivo('dia');
              const hoy = new Date();
              setFechaInicio(hoy.toISOString().split('T')[0]);
              setFechaFin(hoy.toISOString().split('T')[0]);
            }}
          >
            Hoy
          </FilterButton>
          <FilterButton 
            active={filtroActivo === 'semana'} 
            onClick={() => {
              setFiltroActivo('semana');
              const hoy = new Date();
              const hace7Dias = new Date();
              hace7Dias.setDate(hoy.getDate() - 7);
              setFechaInicio(hace7Dias.toISOString().split('T')[0]);
              setFechaFin(hoy.toISOString().split('T')[0]);
            }}
          >
            Semana
          </FilterButton>
          <FilterButton 
            active={filtroActivo === 'mes'} 
            onClick={() => {
              setFiltroActivo('mes');
              const hoy = new Date();
              const hace30Dias = new Date();
              hace30Dias.setDate(hoy.getDate() - 30);
              setFechaInicio(hace30Dias.toISOString().split('T')[0]);
              setFechaFin(hoy.toISOString().split('T')[0]);
            }}
          >
            Mes
          </FilterButton>
        </FilterButtons>
      </FilterSection>

      {/* Tarjetas de estadísticas */}
      <StatsGrid>
        <StatCard>
          <StatIcon color="#3498db">
            <FiDollarSign />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total de Ventas</StatLabel>
            <StatValue>S/ {estadisticas.totalVentas.toFixed(2)}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="#2ecc71">
            <FiTrendingUp />
          </StatIcon>
          <StatInfo>
            <StatLabel>Número de Ventas</StatLabel>
            <StatValue>{estadisticas.numeroVentas}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="#e74c3c">
            <FiCalendar />
          </StatIcon>
          <StatInfo>
            <StatLabel>Promedio por Venta</StatLabel>
            <StatValue>S/ {estadisticas.promedioVenta.toFixed(2)}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="#f39c12">
            <FiPackage />
          </StatIcon>
          <StatInfo>
            <StatLabel>Productos Vendidos</StatLabel>
            <StatValue>{estadisticas.productosTotales}</StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Gráficos */}
      <ChartsGrid>
        {/* Gráfico de líneas - Ventas por día */}
        <ChartContainer>
          <ChartTitle>Ventas por Día</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ventasPorDia()}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3498db" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#3498db" 
                fillOpacity={1} 
                fill="url(#colorVentas)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gráfico de barras - Productos más vendidos */}
        <ChartContainer>
          <ChartTitle>Top 10 Productos Más Vendidos</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productosMasVendidos()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#2ecc71" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gráfico circular - Categorías */}
        <ChartContainer>
          <ChartTitle>Ventas por Categoría</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ventasPorCategoria()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ventasPorCategoria().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gráfico de métodos de pago */}
        <ChartContainer>
          <ChartTitle>Métodos de Pago</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metodosPago()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metodo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="#9b59b6" name="Cantidad" />
              <Bar dataKey="total" fill="#e74c3c" name="Total S/" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartsGrid>

      {/* Tabla de ventas recientes */}
      <RecentSalesSection>
        <SectionTitle>Últimas 10 Ventas</SectionTitle>
        <Table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Método</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.slice(0, 10).map(venta => (
              <tr key={venta.id}>
                <td>{new Date(venta.fecha).toLocaleString('es-PE')}</td>
                <td>{venta.cantidadProductos} items</td>
                <td>S/ {venta.total.toFixed(2)}</td>
                <td>{venta.metodoPago}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </RecentSalesSection>
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
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.text};
  font-size: 28px;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${({ theme }) => theme.primary || "#3498db"};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.primary || "#3498db"}40;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  padding: 20px;
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.text}10;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.text}30;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text};
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  background: ${({ active, theme }) => active ? theme.primary || "#3498db" : theme.bg2};
  color: ${({ active, theme }) => active ? "white" : theme.text};
  border: 1px solid ${({ theme }) => theme.text}20;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${({ theme }) => theme.primary || "#3498db"};
    color: white;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.bg};
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.text}10;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.text}20;
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.p`
  color: ${({ theme }) => theme.text}80;
  font-size: 14px;
  margin: 0;
`;

const StatValue = styled.p`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const ChartContainer = styled.div`
  background: ${({ theme }) => theme.bg};
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.text}10;
`;

const ChartTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  font-size: 18px;
`;

const RecentSalesSection = styled.div`
  background: ${({ theme }) => theme.bg};
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.text}10;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  font-size: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.text}20;
  }

  th {
    color: ${({ theme }) => theme.text};
    font-weight: 600;
    background: ${({ theme }) => theme.bg2};
  }

  td {
    color: ${({ theme }) => theme.text}80;
  }

  tr:hover {
    background: ${({ theme }) => theme.text}05;
  }
`;

// Estilos para cuando no hay acceso
const NoAccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 40px;
`;

const NoAccessIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  filter: grayscale(100%);
`;

const NoAccessTitle = styled.h2`
  color: ${({ theme }) => theme.text};
  font-size: 28px;
  margin-bottom: 15px;
`;

const NoAccessText = styled.p`
  color: ${({ theme }) => theme.text}60;
  font-size: 18px;
  margin-bottom: 30px;
  max-width: 400px;
`;

const LoginButton = styled.button`
  padding: 12px 40px;
  background: ${({ theme }) => theme.primary || "#3498db"};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    background: ${({ theme }) => theme.primaryHover || "#2980b9"};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.primary || "#3498db"}40;
  }
`;