//Se nos exige una pantalla de login y manejo del token en las siguientes peticiones
//El usuario puede iniciar sesión con su usuario, contraseña y mantener su sesión
//Se renderiza el formulario de acceso y el /token devuelve un JWT
//El diseño sigue el Canva: a la izquierda el logo grande (portada) y a la derecha el "USER LOGIN"

import { useEffect, useRef, useState } from 'react';
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

function IconoAlerta() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 5h2v7h-2zm0 9h2v2h-2z" />
        </svg>
    );
}

//Revisa que ambos campos tengan contenido y devuelve los mensajes de error
function validar(username, password) {
    const errores = {};
    if (!username.trim()) errores.username = 'Ingresa tu usuario.';
    if (!password) errores.password = 'Ingresa tu contraseña.';
    return errores;
}

export function Login({ onLogginSucces }) {
    //Tenemos estados de error y cargando para user y password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    const [verPassword, setVerPassword] = useState(false);
    const usuarioRef = useRef(null);
    const passwordRef = useRef(null);

    //Si el login falla, al reactivarse los campos se devuelve el foco al usuario
    useEffect(() => {
        if (error && !loading) usuarioRef.current?.focus();
    }, [error, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError('');

        const nuevosErrores = validar(username, password);
        setErrores(nuevosErrores);
        if (nuevosErrores.username) {
            usuarioRef.current?.focus();
            return;
        }
        if (nuevosErrores.password) {
            passwordRef.current?.focus();
            return;
        }

        setLoading(true);
        try {
            await loginUSer(username.trim(), password);

            if(onLogginSucces) {
                onLogginSucces();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const cambiarUsuario = (e) => {
        setUsername(e.target.value);
        if (errores.username) setErrores((prev) => ({ ...prev, username: undefined }));
    };
    const cambiarPassword = (e) => {
        setPassword(e.target.value);
        if (errores.password) setErrores((prev) => ({ ...prev, password: undefined }));
    };

    const claseCampo = (conError) =>
        `h-12 w-full rounded-full bg-brand/80 text-white font-bold tracking-wider placeholder-brand-gray/90 outline-none transition focus:bg-brand focus:ring-2 disabled:opacity-70 ${
            conError ? 'ring-2 ring-red-400 focus:ring-red-300' : 'focus:ring-brand-light'
        }`;

    return (
    <div className="relative min-h-screen overflow-hidden bg-brand-dark px-6 text-brand-gray">
      {/* Círculos decorativos de fondo */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/20" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-light/10" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 py-10 lg:flex-row lg:gap-20 sm:max-lg:flex-row sm:max-lg:gap-10 sm:max-lg:py-6 bajo:gap-8 bajo:py-4">
        {/* Portada */}
        <div className="flex flex-col items-center text-center sm:max-lg:w-72 sm:max-lg:shrink-0">
          <img
            src={logo}
            alt="Logo de ULA Monitor"
            className="h-40 w-40 rounded-full object-cover shadow-2xl ring-8 ring-brand-gray/20 lg:h-64 lg:w-64 [@media(max-height:520px)]:h-32 [@media(max-height:520px)]:w-32 bajo:ring-4"
          />
          <h1 className="mt-6 text-4xl font-bold tracking-wide md:text-5xl max-lg:text-4xl! bajo:mt-4 [@media(max-height:520px)]:text-3xl!">ULA MONITOR</h1>
          <p className="mt-2 max-w-xs text-brand-light sm:max-lg:max-w-60 bajo:text-sm">
            Monitoreo de oxígeno disuelto en centros de cultivo
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-sm flex-col gap-6 bajo:gap-4">
          <div className="text-center lg:text-left sm:max-lg:text-left">
            <h2 className="text-3xl font-extrabold tracking-wider bajo:text-2xl">INICIAR SESIÓN</h2>
            <p className="mt-1 text-sm text-brand-light">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div role="alert" className="flex items-center justify-center gap-2 rounded-xl border border-red-400 bg-red-500/20 p-3 text-center text-sm font-medium text-red-100">
              <IconoAlerta />
              {error}
            </div>
          )}

          {/* Usuario: ícono a la izquierda */}
          <div>
            <label htmlFor="login-usuario" className="sr-only">Usuario</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-0 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-brand-gray text-brand-dark shadow-md">
                <IconoUsuario />
              </span>
              <input
                ref={usuarioRef}
                id="login-usuario"
                type="text"
                maxlength={25}
                autoComplete="username"
                value={username}
                onChange={cambiarUsuario}
                disabled={loading}
                placeholder="Usuario"
                aria-required="true"
                aria-invalid={Boolean(errores.username)}
                aria-describedby={errores.username ? 'login-usuario-error' : undefined}
                className={`${claseCampo(errores.username)} pl-[4.5rem] pr-5`}
              />
            </div>
            {errores.username && (
              <p id="login-usuario-error" className="mt-2 flex items-center gap-1.5 pl-[4.5rem] text-sm font-medium text-red-200">
                <IconoAlerta />
                {errores.username}
              </p>
            )}
          </div>

          {/* Contraseña: ícono de candado a la izquierda, input con padding a ambos lados y botón de ver contraseña a la derecha */}
          <div>
            <label htmlFor="login-password" className="sr-only">Contraseña</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-0 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-brand-gray text-brand-dark shadow-md">
                <IconoCandado />
              </span>
              <input
                ref={passwordRef}
                id="login-password"
                maxlength={25}
                type={verPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={cambiarPassword}
                disabled={loading}
                placeholder="Contraseña"
                aria-required="true"
                aria-invalid={Boolean(errores.password)}
                aria-describedby={errores.password ? 'login-password-error' : undefined}
                className={`${claseCampo(errores.password)} pl-[4.5rem] pr-14`}
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-2 text-brand-gray transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={verPassword}
              >
                <IconoOjo tachado={verPassword} />
              </button>
            </div>
            {errores.password && (
              <p id="login-password-error" className="mt-2 flex items-center gap-1.5 pl-[4.5rem] text-sm font-medium text-red-200">
                <IconoAlerta />
                {errores.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="mx-auto mt-2 flex w-48 bajo:mt-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-gray py-3 text-lg font-extrabold tracking-wider text-brand-dark shadow-lg transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-dark border-t-transparent" aria-hidden="true" />
            )}
            {loading ? 'INGRESANDO' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
}