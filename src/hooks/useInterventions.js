//Lógica para las intervenciones y listar con filtro por estado
//punto 6 y 7 (SIX SEBEENNN RAHHHHH)
import { useState, useEffect, useRef } from "react";
import { getToken } from "./useAuth"; // Importa la función getToken desde useAuth.js
const API_URL = import.meta.env.VITE_API_URL;
const NumPags = 10;

//Restricciones del motivo
export const MOTIVO_MIN = 10;
export const MOTIVO_MAX = 500;

//Formulario vacío (fuera del hook para que no cambie en cada render)
const FormVacio = {
    tipo: "centro",
    siteId: "",
    motivo: ""
};

//Valida el formulario y devuelve un objeto { campo: mensaje } solo con los campos con error
export function validarIntervencion(form, options) {
    const errores = {};

    if (form.tipo !== "centro" && form.tipo !== "sensor") {
        errores.tipo = "Selecciona si la intervención es para un centro o un sensor.";
    }

    const nombre = form.tipo === "sensor" ? "sensor" : "centro";
    if (!form.siteId) {
        errores.siteId = `Selecciona un ${nombre}.`;
    } else if (!options.some((o) => String(o.value) === String(form.siteId))) {
        errores.siteId = `El ${nombre} seleccionado no es válido.`;
    }

    const motivo = form.motivo.trim();
    if (!motivo) {
        errores.motivo = "Escribe el motivo de la intervención.";
    } else if (motivo.length < MOTIVO_MIN) {
        errores.motivo = `El motivo debe tener al menos ${MOTIVO_MIN} caracteres (llevas ${motivo.length}).`;
    } else if (motivo.length > MOTIVO_MAX) {
        errores.motivo = `El motivo no puede superar los ${MOTIVO_MAX} caracteres.`;
    }

    return errores;
}

export function useInterventions(initialSiteId = '') {
    //Para lista intervenciones
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(""); // Estado inicial para el filtro

    //para formulario
    const [sites, setSites] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [form, setForm] = useState(FormVacio);
    const [formError, setFormError] = useState(null);
    const [sending, setSending] = useState(false);
    const [ok, setOk] = useState(false);
    const [reload, setReload] = useState(0);
    const [touched, setTouched] = useState({}); // Campos que el usuario ya visitó
    const [submitted, setSubmitted] = useState(false); // Si ya intentó enviar
    const [openInterventions, setOpenInterventions] = useState([]); // Abiertas, para avisar duplicados
    const sendingRef = useRef(false); // Evita el doble envío por doble clic

    //para filtro por paginas
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const token = getToken();
        let url = `${API_URL}/interventions?page=${page}&page_size=${NumPags}`;

        if (status) {
            url += `&status=${status}`; // Agrega el filtro de estado si está definido
        }

        //Se ignoran las respuestas de peticiones viejas (filtro o página cambiados rápido)
        const controller = new AbortController();
        let activo = true;

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("No se pudieron obtener las intervenciones.");
                }
                return response.json();
            })
            .then((json) => {
                if (!activo) return;
                const data = json.data ?? [];
                setInterventions(data);
                setHasNext(data.length === NumPags);
            })
            .catch((err) => {
                if (!activo || err.name === "AbortError") return;
                setInterventions([]);
                setHasNext(false);
                setError(err.message === "Failed to fetch" ? "No se pudo conectar con el servidor." : err.message);
            })
            .finally(() => {
                if (activo) setLoading(false);
            });

        return () => {
            activo = false;
            controller.abort();
        };
    }, [status, page, reload]); // Se vuelve a ejecutar cuando cambia el estado o se recarga la lista

    //Intervenciones abiertas (independiente del filtro y la página) para advertir duplicados
    useEffect(() => {
        const controller = new AbortController();
        let activo = true;

        fetch(`${API_URL}/interventions?status=open&page_size=100`, {
            headers: { 'Authorization': `Bearer ${getToken()}` },
            signal: controller.signal,
        })
            .then((response) => (response.ok ? response.json() : { data: [] }))
            .then((json) => { if (activo) setOpenInterventions(json.data ?? []); })
            .catch(() => { if (activo) setOpenInterventions([]); });

        return () => {
            activo = false;
            controller.abort();
        };
    }, [reload]);

    useEffect(() => {
        const headers = {
            'Authorization': `Bearer ${getToken()}`
        };

        // Fetch de sitios
        fetch(`${API_URL}/sites?page_size=100`, { headers })
            .then((response) => response.json())
            .then((json) => setSites(json.data ?? []))
            .catch((err) => console.error("Error al obtener los sitios:", err));

        // Fetch de sensores
        fetch(`${API_URL}/sensors?page_size=100`, { headers })
            .then((response) => response.json())
            .then((json) => setSensors(json.data ?? []))
            .catch((err) => console.error("Error al obtener los sensores:", err));

    }, []);

    //Preselecciona el centro cuando se viene desde la página de Centros
    useEffect(() => {
        if (!initialSiteId || sites.length === 0) return;
        setForm((prevForm) => prevForm.siteId ? prevForm : { ...prevForm, tipo: "centro", siteId: String(initialSiteId) });
    }, [initialSiteId, sites]);

    //El mensaje de éxito se oculta solo tras unos segundos
    useEffect(() => {
        if (!ok) return;
        const t = setTimeout(() => setOk(false), 4000);
        return () => clearTimeout(t);
    }, [ok]);

    const options = form.tipo === "centro"
        ? sites.map((site) => ({ value: site.id, label: site.name }))
        : sensors.map((sensor) => {
            const centro = sites.find((s) => s.id === sensor.site_id)?.name ?? `Centro ${sensor.site_id}`;
            return { value: sensor.id, label: `Sensor ${sensor.id} (${centro})` };
        });

    //Errores de validación: se muestran solo en campos tocados o después de intentar enviar
    const allErrors = validarIntervencion(form, options);
    const errors = Object.fromEntries(
        Object.entries(allErrors).filter(([campo]) => submitted || touched[campo])
    );

    const canSubmit = !sending; // El botón siempre se puede pulsar salvo mientras envía

    //Advertencia (no bloquea): ya hay una intervención abierta para el mismo centro/sensor
    const id = Number(form.siteId);
    const duplicada = form.siteId
        ? openInterventions.find((i) => form.tipo === "sensor"
            ? i.sensor_id === id
            : i.site_id === id && !i.sensor_id)
        : null;
    const warning = duplicada
        ? `Ya existe una intervención abierta para este ${form.tipo === "sensor" ? "sensor" : "centro"}. Puedes registrar otra igualmente.`
        : null;

    const changeField = (campo, valor) => {
        setOk(false);
        setFormError(null);
        setForm((prevForm) => ({
            ...prevForm,
            [campo]: valor,
            // Al cambiar el tipo solo se limpia el centro/sensor, el motivo se conserva
            ...(campo === "tipo" ? { siteId: "" } : {})
        }));
        if (campo === "tipo") {
            setTouched((prev) => ({ ...prev, siteId: false }));
        }
    };

    const blurField = (campo) => {
        setTouched((prev) => (prev[campo] ? prev : { ...prev, [campo]: true }));
    };

    const cancel = () => {
        setForm(FormVacio);
        setFormError(null);
        setOk(false);
        setTouched({});
        setSubmitted(false);
    };

    //Devuelve los errores encontrados para que el formulario pueda enfocar el primero
    const submit = (e) => {
        e?.preventDefault();
        if (sendingRef.current) return {};

        setSubmitted(true);
        setFormError(null);
        setOk(false);

        if (Object.keys(allErrors).length > 0) {
            return allErrors;
        }

        sendingRef.current = true;
        setSending(true);

        const reason = form.motivo.trim();

        let body;
        if (form.tipo === "centro") {
            body = {
                site_id: id,
                reason: reason
            };
        } else {
            const sensor = sensors.find((s) => s.id === id);
            body = {
                site_id: sensor.site_id,
                sensor_id: id,
                reason: reason
            };
        }

        fetch(`${API_URL}/interventions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify(body),
        })
            .then((response) => {
                if (!response.ok) { throw new Error("No se pudo registrar la intervención. Inténtalo nuevamente."); }
                return response.json();
            })
            .then(() => {
                setForm(FormVacio);
                setTouched({});
                setSubmitted(false);
                setOk(true);
                setPage(1);
                setReload((prev) => prev + 1); // Incrementa el contador para recargar la lista
            })
            .catch((err) => {
                setFormError(err.message === "Failed to fetch" ? "No se pudo conectar con el servidor." : err.message);
            })
            .finally(() => {
                sendingRef.current = false;
                setSending(false);
            });

        return {};
    };

    const changeStatus = (value) => {
        setStatus(value);
        setPage(1);
    };

    return {
        interventions, loading, error, status, changeStatus, // Exponemos la función para actualizar el estado del filtro
        form, options, canSubmit, changeField, cancel, submit, formError, sending, ok,
        errors, blurField, warning, submitted,
        page, setPage, hasNext,
        sites

    };
}
