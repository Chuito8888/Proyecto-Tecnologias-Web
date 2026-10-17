//Una barrita de navegacion ya que se nos pide un Diseño coherente y navegación clara
//Debería servir como un menú lateral para cambiar de sección rapidamente y de manera intuitiva
//Deberían ser unas 3 o 4 secciones

import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

//La barra de navegación hace referencia a las rutas que estan en pages
export function NavegationBar({onLogout}) {
  return(
      <nav className= "w-64 shrink-0 min-h-screen flex flex-col justify-center text-center bg-[#124045] text-white font-bold items-center gap-4 p-4">
        <img 
          src={logo} 
          alt="Logo de la aplicación" 
          className="w-24 h-24 rounded-full mt-4 mb-6 object-cover" 
        />
        <div className= "flex flex-col gap-4 w-full text-center">
          <Link className=" bg-[#54867d] rounded-md w-50 h-10 flex-col justify-center items-center shadow-xl hover:bg-teal-300 transition-colors duration-200" to="/">Inicio</Link> {' '}
          <Link className=" bg-[#54867d] rounded-md w-50 h-10 flex-col justify-center items-center shadow-xl hover:bg-teal-300 transition-colors duration-200" to="/centros">Centros</Link> {' '}
          <Link className=" bg-[#54867d] rounded-md w-50 h-10 flex-col justify-center items-center shadow-xl hover:bg-teal-300 transition-colors duration-200" to="/intervenciones">Intervenciones</Link> 
        </div>     
        <button
          onClick={onLogout}
          className="mt-auto mb-4 w-full py-2.5 px-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors text-center text-sm font-semibold shadow-md"
        >
          Cerrar Sesión
        </button>
      </nav>
  )
}
 