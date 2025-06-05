import React, { useState } from 'react'
import { MyRouters } from './routers/routes';
import styled from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import {Sidebar} from "./components/Sidebar";
import { Light, Dark } from './styles/Themes';  
import { ThemeProvider } from 'styled-components';

export const themeContext = React.createContext(null);
function App() {
  const [theme, setTheme] = useState('Light');
  const themeStyle = theme==='Light'? Light : Dark;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
    <themeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={themeStyle}>
        <BrowserRouter>
          <AppContainer>
            <SidebarContainer isOpen={sidebarOpen}>
              <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            </SidebarContainer>
            <MainContent isOpen={sidebarOpen}>
              <MyRouters />
            </MainContent>
          </AppContainer>
        </BrowserRouter>
      </ThemeProvider>
    </themeContext.Provider>
    </>
  );
}
const AppContainer = styled.div`
  display: flex;
`;
const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ isOpen }) => (isOpen ? '300px' : '90px')};
  background-color: ${({ theme }) => theme.sidebar}; // Usa el color que quieras si no tienes theme.sidebar
  transition: width 0.3s;
  z-index: 999;
`;
const MainContent = styled.div`
    margin-left: ${({ isOpen }) => (isOpen ? '300px' : '90px')};
  width: calc(100% - ${({ isOpen }) => (isOpen ? '300px' : '90px')});
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  transition: all 0.3s;
  min-height: 100vh;
  overflow-x: auto;
`;
export default App;
