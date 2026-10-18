//"Listar intervenciones con filtro por estado"
//Muestra un historial de las intervenciones, permitiendo también filtrarlas por estado

import React from 'react';
//Botones de filtro por estado
const Estados = [
  { label: "Todas", value: "" },
  { label: "Abiertas", value: "open" },
  { label: "cerradas", value: "closed" },
]

export function InterventionList({ interventions, loading, error, status, onStatusChange, page, hasNext, onPageChange, sites }) {
  return (
    <section className="rounded-lg bg-slate-100 p-6 ">
      <h2 className="text-black mb-4 text-2xl font-bold ">Historial de Intervenciones</h2>
      {/** botones de filtro por estado */}
      <div className="flex flex-wrap space-x- flex gap-3">
        {Estados.map((estado) => (
          <button
            key={estado.value}
            className={` rounded px-4 py-2 font-semibold transition-colors duration-300 ${status === estado.value
              ? "bg-[#54867d] text-white"
              : "bg-[#86b4a7] text-black hover:bg-#86b4a7-300"
              }`}
            onClick={() => onStatusChange(estado.value)}
          >
            {estado.label}
          </button>
        ))}
      </div>

      {/** mensajes de error */}
      {loading && <p className="text-gray-500">Cargando intervenciones...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && interventions.length === 0 && (
        <p className="text-gray-500">No hay intervenciones para mostrar.</p>
      )}

      {/** tabla de intervenciones */}
      <table className="w-full border-collapse border border-gray-300 rounded-lg">
        <thead>
          <tr className="bg-[#c8d1d9] ">
            <th className=" text-black border border-gray-300 px-4 py-2">Nombre</th>
            <th className="text-black border border-gray-300 px-4 py-2">Fecha</th>

            <th className="text-black border border-gray-300 px-4 py-2">Motivo</th>
            <th className="text-black border border-gray-300 px-4 py-2">Estado</th>
          </tr>
        </thead>

        <tbody>
          {interventions.map((intervention) => (
            <tr key={intervention.id} className="border border-gray-300">
              
              <td className="text-black border border-gray-300 px-4 py-2">
                {sites.find((s) => s.id === intervention.site_id)?.name ?? `Centro ${intervention.site_id}`}
                {intervention.sensor_id ? ` · Sensor ${intervention.sensor_id}` : ""}
              </td>
              <td className="text-black border border-gray-300 px-4 py-2">{intervention.created_at.replace('T', ' ').slice(0, 19)}</td>
              <td className="text-black border border-gray-300 px-4 py-2">{intervention.reason}</td>
              <td className="text-black border border-gray-300 px-4 py-2">{intervention.status}</td>

            </tr>
          ))}
        </tbody>

      </table>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || loading}
          className="rounded bg-[#86b4a7] 200 px-4 py-2 font-semibold "
        >
          Anterior
        </button>
        <span className="font-semibold text-black">Página {page}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext || loading}
          className="rounded bg-[#86b4a7] 200 px-4 py-2 font-semibold "
        >
          Siguiente
        </button>
      </div>



    </section>

  );
}