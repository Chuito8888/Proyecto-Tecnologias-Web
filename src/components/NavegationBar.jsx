//Una barrita de navegacion ya que se nos pide un Diseño coherente y navegación clara
//Debería servir como un menú lateral para cambiar de sección rapidamente y de manera intuitiva
//Deberían ser unas 3 o 4 secciones

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';

//Íconos SVG simples para cada sección
function IconoInicio() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function IconoCentros() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function IconoIntervenciones() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="M9 11h6M9 15h4" />
    </svg>
  );
}

function IconoSalir() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h10" />
    </svg>
  );
}

//Secciones de la aplicación (rutas que están en pages)
const SECCIONES = [
  { to: '/', etiqueta: 'Inicio', Icono: IconoInicio },
  { to: '/centros', etiqueta: 'Centros', Icono: IconoCentros },
  { to: '/intervenciones', etiqueta: 'Intervenciones', Icono: IconoIntervenciones },
];

//Clases base compartidas por enlaces y botón de salir: mismo alto, ancho y alineación
//A <1024px (proyector) quedan solo íconos centrados; con poca altura, un poco más bajos
const ITEM_BASE = 'flex h-11 w-full items-center justify-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 md:justify-start max-lg:justify-center! max-lg:px-0! bajo:h-10!';

//Clases del enlace según si la sección está activa o no
function clasesEnlace({ isActive }) {
  return isActive
    ? `${ITEM_BASE} bg-brand text-white shadow-md focus-visible:ring-brand-light`
    : `${ITEM_BASE} text-brand-gray hover:bg-white/10 hover:text-white focus-visible:ring-brand-light`;
}

//Diálogo propio para confirmar el cierre de sesión y evitar clics accidentales
function ConfirmarCierre({ onCancelar, onConfirmar }) {
  const cancelarRef = useRef(null);
  const confirmarRef = useRef(null);
  //Recuerda si el clic empezó sobre el fondo oscuro
  const clicEnFondo = useRef(false);

  //Foco inicial en "Cancelar", cierre con Escape y foco retenido dentro del diálogo
  useEffect(() => {
    cancelarRef.current?.focus();
    const alPresionar = (e) => {
      if (e.key === 'Escape') {
        onCancelar();
        return;
      }
      if (e.key !== 'Tab') return;
      //Solo hay dos botones: el foco rota entre ellos sin salir del diálogo
      const primero = cancelarRef.current;
      const ultimo = confirmarRef.current;
      const activo = document.activeElement;
      const dentro = activo === primero || activo === ultimo;
      if (!e.shiftKey && (activo === ultimo || !dentro)) {
        e.preventDefault();
        primero?.focus();
      } else if (e.shiftKey && (activo === primero || !dentro)) {
        e.preventDefault();
        ultimo?.focus();
      }
    };
    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [onCancelar]);

  //Se monta en el body para quedar por encima de todo (incluido el mapa de Leaflet)
  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 bajo:overflow-y-auto"
      onMouseDown={(e) => {
        clicEnFondo.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        //Se cierra solo si el clic empezó y terminó en el fondo
        if (clicEnFondo.current && e.target === e.currentTarget) onCancelar();
        clicEnFondo.current = false;
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cerrar-sesion-titulo"
        aria-describedby="cerrar-sesion-texto"
        className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl bajo:p-5!"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-danger">
            <IconoSalir />
          </span>
          <div>
            <h2 id="cerrar-sesion-titulo" className="text-lg font-bold text-brand-dark">¿Cerrar sesión?</h2>
            <p id="cerrar-sesion-texto" className="mt-1 text-sm text-brand-dark/80">
              Volveras a la pantalla de inicio de sesión.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 bajo:mt-4!">
          <button ref={cancelarRef} type="button" className="btn btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
          <button ref={confirmarRef} type="button" className="btn btn-danger" onClick={onConfirmar}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

//La barra de navegación hace referencia a las rutas que estan en pages
export function NavegationBar({ onLogout }) {
  //Controla si se muestra el diálogo de confirmación
  const [confirmando, setConfirmando] = useState(false);
  //Botón que abre el diálogo, para devolverle el foco al cancelar
  const botonSalirRef = useRef(null);
  const cancelar = useCallback(() => {
    setConfirmando(false);
    requestAnimationFrame(() => botonSalirRef.current?.focus());
  }, []);

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky top-0 flex h-screen w-20 shrink-0 flex-col items-center gap-6 overflow-y-auto bg-brand-dark px-3 py-6 text-white md:w-64 md:px-4 max-lg:w-20! max-lg:px-3! bajo:gap-3! bajo:py-3!"
    >
      {/* Logo y título centrados (a <1024px solo el logo, barra angosta) */}
      <div className="flex w-full flex-col items-center gap-3 text-center">
        <img
          src={logo}
          alt="Logo de ULA Monitor"
          className="h-12 w-12 rounded-full object-cover shadow-lg ring-2 ring-brand-light/40 md:h-20 md:w-20 max-lg:h-12! max-lg:w-12! bajo:h-10! bajo:w-10!"
        />
        <div className="hidden md:block max-lg:hidden!">
          <p className="text-lg font-bold leading-tight">ULA Monitor</p>
          <p className="text-xs font-medium text-brand-light">Monitoreo de centros</p>
        </div>
      </div>

      <div className="h-px w-full shrink-0 bg-white/10" />

      {/* Enlaces de navegación, todos del mismo ancho y con la sección activa resaltada */}
      <ul className="flex w-full flex-col gap-2 bajo:gap-1.5!">
        {SECCIONES.map(({ to, etiqueta, Icono }) => (
          <li key={to}>
            <NavLink to={to} end={to === '/'} className={clasesEnlace} title={etiqueta} aria-label={etiqueta}>
              <Icono />
              <span className="hidden md:inline max-lg:hidden!">{etiqueta}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="h-px w-full shrink-0 bg-white/10" />

      {/* Cierre de sesión siempre visible, justo debajo de la navegación */}
      <button
        ref={botonSalirRef}
        type="button"
        onClick={() => setConfirmando(true)}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        aria-haspopup="dialog"
        className={`${ITEM_BASE} cursor-pointer text-red-200 hover:bg-danger hover:text-white focus-visible:ring-red-300`}
      >
        <IconoSalir />
        <span className="hidden md:inline max-lg:hidden!">Cerrar sesión</span>
      </button>

      {/* Pie de la barra (se oculta en proyector y con poca altura) */}
      <p className="mt-auto hidden text-center text-xs text-brand-light/70 md:block max-lg:hidden! bajo:hidden!">
        Tecnologías Web y Móviles
      </p>

      {confirmando && (
        <ConfirmarCierre
          onCancelar={cancelar}
          onConfirmar={() => {
            setConfirmando(false);
            onLogout();
          }}
        />
      )}
    </nav>
  );
}
