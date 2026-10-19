//Lógica para las intervenciones y listar con filtro por estado
//punto 6 y 7 (SIX SEBEENNN RAHHHHH)
import { useState, useEffect } from "react";
import { getToken } from "./useAuth"; // Importa la función getToken desde useAuth.js
const API_URL = import.meta.env.VITE_API_URL;
const NumPags = 10;

export function useInterventions(initialSiteId = '') {
    //Para lista intervenciones
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(""); // Estado inicial para el filtro

    //para formulario 
    const FormVacio = {
        tipo: "centro",
        siteId: "",
        motivo: ""
    };

    const [sites, setSites] = useState([]);
    const [sensors, setSensors] = useState([]);
    const [form, setForm] = useState(FormVacio);
    const [formError, setFormError] = useState(null);
    const [sending, setSending] = useState(false);
    const [ok, setOk] = useState(false);
    const [reload, setReload] = useState(0);

    //para filtro por paginas

    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);



    useEffect(() => {
        setLoading(true);
        setError(null);

        const token = getToken();
        let url = `${API_URL}/interventions?page=${page}&page_size=${NumPags}`; // Ajusta el tamaño de página según tus necesidades

        if (status) {
            url += `&status=${status}`; // Agrega el filtro de estado si está definido
        }

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al obtener las intervenciones.");
                }
                return response.json();
            })
            .then((json) => {
                setInterventions(json.data);
                setHasNext(json.data.length === NumPags);
            })
    
        .catch((err) => {
            setError(err.message);
            setLoading(false);
        })

        .finally(() => {
            setLoading(false);


        });

}, [status, page, reload]); // Se vuelve a ejecutar cuando cambia el estado o se recarga la lista 

useEffect(() => {
    const headers = {
        'Authorization': `Bearer ${getToken()}`
    };

    // Fetch de sitios
    fetch(`${API_URL}/sites?page_size=100`, { headers })
        .then((response) => response.json())
        .then((json) => setSites(json.data))
        .catch((err) => console.error("Error al obtener los sitios:", err));

    // Fetch de sensores
    fetch(`${API_URL}/sensors?page_size=100`, { headers })
        .then((response) => response.json())
        .then((json) => setSensors(json.data))
        .catch((err) => console.error("Error al obtener los sensores:", err));

}, []);

useEffect(() => {
    if (!initialSiteId || sites.length === 0) return;
    setForm((prevForm) => prevForm.siteId ? prevForm : { ...prevForm, siteId: String(initialSiteId) });
}, [initialSiteId, sites]);

const options = form.tipo === "centro" ? sites.map((site) => ({ value: site.id, label: site.name })) : sensors.map((sensor) => ({ value: sensor.id, label: `Sensor ${sensor.id} (Centro ${sensor.site_id})` }));

const canSubmit = Boolean(form.tipo && form.siteId && form.motivo.trim() && !sending); // Verifica que todos los campos estén completos y que no se esté enviando

const changeField = (campo, valor) => {
    setOk(false);
    setForm((prevForm) => ({
        ...prevForm,
        [campo]: valor,
        ...(campo === "tipo" ? { siteId: "", motivo: "" } : {})
    }));
};

const cancel = () => {
    setForm(FormVacio);
    setFormError(null);
    setOk(false);
}

const submit = (e) => {
    e.preventDefault();
    setFormError(null);
    setSending(true);
    setOk(false);

    const id = Number(form.siteId);
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
            if (!response.ok) { throw new Error("Error al crear la intervención."); }
            return response.json();
        })
        .then((json) => {
            setForm(FormVacio);
            setOk(true);
            setPage(1);
            setReload((prev) => prev + 1); // Incrementa el contador para recargar la lista
        })
        .catch((err) => {
            setFormError(err.message);
        })
        .finally(() => {
            setSending(false);
        });

    
};
const changeStatus = (value) => {
        setStatus(value);
        setPage(1);
};

return {
    interventions, loading, error, status, changeStatus, // Exponemos la función para actualizar el estado del filtro
    form, options, canSubmit, changeField, cancel, submit, formError, sending, ok,
    page, setPage, hasNext,
    sites

};
}



