//Una barrita de navegacion ya que se nos pide un Diseño coherente y navegación clara
//Debería servir como un menú lateral para cambiar de sección rapidamente y de manera intuitiva
//Deberían ser unas 3 o 4 secciones

import React from 'react';
import { Link } from 'react-router-dom';

//La barra de navegación hace referencia a las rutas que estan en pages
export default function NavegationBar() {
  return(
    <nav style={{ padding: '1rem', backgroundColor: '#3d3569' }}>
      <Link style={{ color: '#ffffffe2', textDecoration: 'underline' }} to="/">Inicio</Link> |{' '}
      <Link style={{ color: '#ffffffe2', textDecoration: 'underline' }} to="/centros">Centros</Link> |{' '}
      <Link style={{ color: '#ffffffe2', textDecoration: 'underline' }} to="/intervenciones">Intervenciones</Link> 
    </nav>
  )
}
 