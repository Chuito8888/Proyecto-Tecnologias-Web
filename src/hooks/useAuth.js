//Manejo de la autenticacion
//Aquí llamaremos a la api para autenticar las credenciales
//Necesario para el Login

const API_URL = import.meta.env.VITE_API_URL;


export async function loginUSer(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    //Para comprobar problemas con la ruta en consola
    const fullUrl = `${API_URL}/token`;
    console.log("Intentando conectar a:", fullUrl);

    try {
        const response = await fetch(`${API_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        //En caso de que haya algún error:
        if (!response.ok) {
            if (response.status === 401 || response.status === 400) {
                throw new Error("Usuario o contraseña incorrectos.");
            }
            throw new Error("Ocurrió un error al iniciar sesión. Inténtalo más tarde.");
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        return data.access_token;
    } catch (err) {
        if (err.message.includes("Usuario o contraseña")) {
            throw err;
        }
        throw new Error("No se pudo conectar con el servidor. Revisa tu conexión.");
    }
}

//Helper para obtener el token guardado
export function getToken() {
    return localStorage.getItem('token');
}

//Funcion para cerrar sesión
export function logout() {
    localStorage.removeItem('token');
}

//Funcion para saber si el usuario está autenticado
export function isAuthenticated() {
    return !!localStorage.getItem('token');
}