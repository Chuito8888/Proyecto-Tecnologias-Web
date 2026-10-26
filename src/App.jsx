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
      {/* La barra lateral queda fija y solo el contenido (main) hace scroll */}
      <div className="flex h-dvh overflow-hidden">
        <NavegationBar onLogout={handleLogout} />

        {/* main ocupa todo el espacio restante (flex-1) a la derecha; padding menor en proyector */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 text-white md:p-6 lg:p-8 max-lg:p-4! bajo:p-4!">
          <Routes>
            <Route path="/" element={<HomePage />} /> {/*Contiene todo el dashboard*/}
            <Route path="/centros" element={<SitesPage />} /> {/*Contiene todo lo relacionado a centros y sitios*/}
            <Route path="/intervenciones" element={<InterventionsPage />} /> {/*Contiene todo lo relacionado a intervenciones*/}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;