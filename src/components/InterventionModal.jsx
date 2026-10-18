export function InterventionModal({ form, options, canSubmit, changeField, cancel, submit, formError, sending, ok }) {
    return (
        <form onSubmit={submit} className="text-black rounded-lg bg-white p-6 ">
            <h2 className="mb-4 text-black bg-[#54867d] ">Nueva Intervención</h2>

            {/* Centro o Sensor */}
            <label className="block font-semibold text-black">
                Tipo
                <select
                    value={form.tipo}
                    onChange={(e) => changeField("tipo", e.target.value)}
                    className="mt-1 w-full rounded  bg-[#c8d1d9]"
                >
                    <option value="centro">Centro</option>
                    <option value="sensor">Sensor</option>
                </select>
            </label>

            {/* Cuál centro o sensor */}
            <label className="text-black mt-4 block font-semibold">
                {form.tipo === "centro" ? "Centro" : "Sensor"}
                <select
                    value={form.siteId}
                    onChange={(e) => changeField("siteId", e.target.value)}
                    className="mt-1 w-full rounded  bg-[#c8d1d9]"
                >
                    <option value="">Selecciona</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </label>

            {/* Motivo */}
            <label className="mt-4 block font-semibold">
                Motivo
                <textarea
                    value={form.motivo}
                    onChange={(e) => changeField("motivo", e.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded  bg-[#c8d1d9]"
                />
            </label>

            {formError && <p className="mt-3 text-red-500">{formError}</p>}
            {ok && <p className="mt-3 text-green-600">Intervención abierta correctamente.</p>}

            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={cancel} className="rounded bg-[#86b4a7] 200 px-4 py-2 font-semibold">
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="rounded bg-[#54867d] 200 px-4 py-2 font-semibold"
                >
                    {sending ? "Enviando…" : "Enviar"}
                </button>
            </div>
        </form>
    );
}