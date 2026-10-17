//Se nos exige una pantalla de login y manejo del token en las siguientes peticiones
//El usuario puede iniciar sesión con su usuario, contraseña y mantener su sesión
//Se renderiza el formulario de acceso y el /token devuelve un JWT

import {useState} from 'react';
import { loginUSer } from '../hooks/useAuth';
import logo from '../assets/logo.png';

export function Login({ onLogginSucces }) {
    //Tenemos estados de error y cargando para user y password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-[#0d2a2e] px-4">
      <div className="bg-[#124045] p-8 rounded-xl shadow-2xl w-full max-w-md text-white border border-[#1a555c]">
        <img 
            src={logo} 
            alt="Logo de la aplicación" 
            className="w-24 h-24 rounded-full mt-4 mb-6 object-cover flex items-center justify-center mx-auto " 
        />
        <h2 className="text-3xl font-bold text-center mb-6">ULA Monitors</h2>
        <p className="text-gray-300 text-center mb-8">Ingresa tus credenciales para acceder</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Usuario</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#0d2a2e] border border-[#1a555c] text-white focus:outline-none focus:border-teal-400"
              placeholder="Ej: el tren de aura"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#0d2a2e] border border-[#1a555c] text-white focus:outline-none focus:border-teal-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-teal-600 hover:bg-teal-500 font-bold rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
