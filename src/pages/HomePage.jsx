//Aquí se debería crear la ruta para la vista principal al abrir la página

import React from 'react';
import { Dashboard } from '../components/Dashboard';

//aquí se mostrará el contenido de Dashboard.jsx
export function HomePage() {
  return (
    <div>
      <Dashboard />
    </div>
  );
}