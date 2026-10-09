import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavegationBar } from './components/NavegationBar';
import { HomePage } from './pages/HomePage';
import { SitesPage } from './pages/SitesPage';
import { InterventionsPage } from './pages/InterventionsPage';

export function App() {
  return (
    <BrowserRouter>
      <NavegationBar />
      <main style={{ padding: '1rem' }}>
        <Routes>
            {/*Aquí se definen las rutas para las diferentes páginas de la aplicación*/}
            {/*Al checar la url se vé como cambia dependiendo de en que página estemos*/}
          <Route path="/" element={<HomePage />} />
          <Route path="/centros" element={<SitesPage />} />
          <Route path="/intervenciones" element={<InterventionsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;