//El enunciado dice que no hay un endpoint para el Dashboard asi que lo hacemo nosotros con el front end combinando las rutas anteriores
//Debería ser la pantalla principal posterior al inicio de sesión y muestra un resumen de los datos y las métricas
//basicamente debería ser como una pizarra

import React from 'react';

export function Dashboard() {
  return (
    <div>
      <h1 style={{ color: '#c68fe5', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Inicio / Dashboard</h1>
      <p style={{fontFamily: 'Comic Sans MS'}}>Bienvenido al Dashboard causa</p>
    </div>
  );
}