import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavegationBar } from './components/NavegationBar';
import { HomePage } from './pages/HomePage';
import { SitesPage } from './pages/SitesPage';
import { InterventionsPage } from './pages/InterventionsPage';
import {useState} from 'react';
import {isAuthenticated, logout} from './hooks/useAuth.js';
import {Login} from './components/Login.jsx';


export function App() {

  //UseState para manejar la autenticación del usuario
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  //Login con éxito, se mantiene el usuario autenticado
  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  //Se cierra la sesión cambiando la autenticación del usuario
  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  //Si el usuario no está autenticado, se muestra la pantalla de login
  if(!authenticated) {
    return <Login onLogginSucces={handleLoginSuccess} />;
  }

return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <NavegationBar onLogout={handleLogout} />
        
        {/* main ocupa todo el espacio restante (flex-1) a la derecha */}
        <main className="flex-1 p-8 text-white overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/centros" element={<SitesPage />} />
            <Route path="/intervenciones" element={<InterventionsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;