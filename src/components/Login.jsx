//Se nos exige una pantalla de login y manejo del token en las siguientes peticiones
//El usuario puede iniciar sesión con su usuario, contraseña y mantener su sesión
//Se renderiza el formulario de acceso y el /token devuelve un JWT
//El diseño sigue el Canva: a la izquierda el logo grande (portada) y a la derecha el "USER LOGIN"

import {useState} from 'react';
import { loginUSer } from '../hooks/useAuth';
import logo from '../assets/logo.png';

//Íconos simples en SVG para no instalar otra librería
function IconoUsuario() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="8" r="4.2" />
            <path d="M3.5 21c0-4.4 3.8-7.5 8.5-7.5s8.5 3.1 8.5 7.5z" />
        </svg>
    );
}

function IconoCandado() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M7 10V7.5a5 5 0 0 1 10 0V10h-2.2V7.5a2.8 2.8 0 0 0-5.6 0V10z" />
            <rect x="4.5" y="10" width="15" height="11" rx="2" />
        </svg>
    );
}

function IconoOjo({ tachado }) {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {tachado && <path d="M4 4l16 16" />}
        </svg>
    );
}

export function Login({ onLogginSucces }) {
    //Tenemos estados de error y cargando para user y password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verPassword, setVerPassword] = useState(false);

    const handleSubmit = async (e) => {
        //Por defecto no recargamos la página al enviar el formulario
        //Se limpia el error y se activa el estado de cargando
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            //Se llama a la función de loginUSer (hook de autenticación) para autenticar al usuario
            await loginUSer(username, password);

            //Si sale bien, joya
            if(onLogginSucces) {
                onLogginSucces();
            }
            //Si no sale bien, se captura el error y se muestra en pantalla, se deja de cargar la página
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="relative min-h-screen overflow-hidden bg-[#124045] px-6 text-[#c8d1d9]">
      {/* Círculos decorativos de fondo, en los mismos tonos del proyecto */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#54867d]/20" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#86b4a7]/10" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 py-10 lg:flex-row lg:gap-20">

        {/* Portada: logo grande como en la primera página del Canva */}
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Logo de ULA Monitor"
            className="h-40 w-40 rounded-full object-cover shadow-2xl ring-8 ring-[#c8d1d9]/20 lg:h-64 lg:w-64"
          />
          <h1 className="mt-6 text-4xl font-extrabold tracking-wide md:text-5xl">ULA MONITOR</h1>
          <p className="mt-2 max-w-xs text-[#86b4a7]">
            Monitoreo de oxígeno disuelto en centros de cultivo
          </p>
        </div>

        {/* Formulario: "USER LOGIN" del Canva */}
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-6">
          <h2 className="text-center text-3xl font-extrabold tracking-wider lg:text-left">INICIAR SESIÓN</h2>

          {error && (
            <div className="rounded-xl border border-red-400 bg-red-500/20 p-3 text-center text-sm text-red-100">
              {error}
            </div>
          )}

          {/* Usuario: ícono a la izquierda, como en el Canva */}
          <label className="relative block">
            <span className="sr-only">Usuario</span>
            <span className="absolute left-0 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#c8d1d9] text-[#124045] shadow-md">
              <IconoUsuario />
            </span>
            <span className="absolute left-[4.25rem] top-1/2 -translate-y-1/2 text-[#f4a3a3]" aria-hidden="true">*</span>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
              className="h-12 w-full rounded-full bg-[#54867d]/80 pl-20 pr-5 text-white placeholder-[#dfe7e5] outline-none transition focus:bg-[#54867d] focus:ring-2 focus:ring-[#86b4a7]"
            />
          </label>

          {/* Contraseña: candado a la derecha, como en el Canva, y botón para mostrarla */}
          <label className="relative block">
            <span className="sr-only">Contraseña</span>
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#f4a3a3]" aria-hidden="true">*</span>
            <input
              type={verPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="h-12 w-full rounded-full bg-[#54867d]/80 pl-9 pr-28 text-white placeholder-[#dfe7e5] outline-none transition focus:bg-[#54867d] focus:ring-2 focus:ring-[#86b4a7]"
            />
            <button
              type="button"
              onClick={() => setVerPassword((v) => !v)}
              className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#dfe7e5] transition hover:text-white"
              aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <IconoOjo tachado={verPassword} />
            </button>
            <span className="absolute right-0 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#c8d1d9] text-[#124045] shadow-md">
              <IconoCandado />
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mx-auto mt-2 flex w-48 items-center justify-center gap-2 rounded-xl bg-[#c8d1d9] py-3 text-lg font-extrabold tracking-wider text-[#124045] shadow-lg transition hover:-translate-y-0.5 hover:bg-white disabled:translate-y-0 disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#124045] border-t-transparent" aria-hidden="true" />
            )}
            {loading ? 'INGRESANDO' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
