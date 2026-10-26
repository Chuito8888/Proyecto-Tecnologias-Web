//Panel "Requieren atención" del Dashboard
//Muestra los sensores con problemas, primero los fuera de rango con el oxígeno más bajo
//y después los que no transmiten (el que lleva más tiempo sin datos primero)
//Desde aquí se puede abrir una intervención sin salir del Dashboard

import React, { useState } from 'react';
import { LineChart, Line, YAxis, ReferenceLine } from 'recharts';
import { formatOxygen, timeAgo, ESTADOS_SENSOR, MENSAJE_SIN_DATOS } from '../utils/format';
import { validarMotivo, MOTIVO_MIN, MOTIVO_MAX } from '../hooks/useDashboard';

//Minigráfico de las últimas 24 h, con la línea punteada del mínimo permitido
function Sparkline({ puntos, minimo, color }) {
  if (!puntos || puntos.length < 2) {
    return <span className="text-xs text-gray-500">Sin datos en 24 h</span>;
  }
  return (
    <LineChart width={130} height={36} data={puntos} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
      <YAxis hide domain={[(min) => Math.min(min, minimo ?? min) - 0.5, 'dataMax']} />
      {minimo !== undefined && <ReferenceLine y={minimo} stroke={ESTADOS_SENSOR.no_data.color} strokeDasharray="3 3" />}
      <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
    </LineChart>
  );
}

//Filas grises que laten mientras cargan los sensores
function FilasCargando() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 border-t border-brand-gray pt-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-brand-gray" />
            <div className="h-3 w-20 rounded bg-brand-gray/70" />
          </div>
          <div className="h-6 w-24 rounded-full bg-brand-gray" />
          <div className="hidden h-8 w-32 rounded bg-brand-gray/70 sm:block" />
          <div className="h-8 w-28 rounded-lg bg-brand-gray" />
        </div>
      ))}
    </div>
  );
}

//Motivo que se propone al abrir la intervención, el usuario lo puede editar
function defaultReason(alerta) {
  if (alerta.status === 'out_of_range') {
    return `Fuera de rango: ${formatOxygen(alerta.lastValue)} (rango ${alerta.min}–${alerta.max} mg/L)`;
  }
  return `Sin transmisión, último dato ${timeAgo(alerta.lastAt)}`;
}

export function AlertsTable({ alerts, trends, loading, sinDatos = false, onOpenIntervention, onShowChart }) {
  //Sensor al que se le está abriendo una intervención (solo uno a la vez)
  const [editando, setEditando] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [intentado, setIntentado] = useState(false); // Se valida en vivo solo después del primer intento de envío
  const [errorEnvio, setErrorEnvio] = useState(null); // Error que devuelve la API
  const [exito, setExito] = useState(null); // Nombre del sensor al que se le abrió la intervención

  //Error del campo: solo se muestra después de intentar enviar
  const errorMotivo = intentado ? validarMotivo(motivo) : null;
  const largo = motivo.trim().length;

  const empezar = (alerta) => {
    setEditando(alerta.sensorId);
    setMotivo(defaultReason(alerta));
    setIntentado(false);
    setErrorEnvio(null);
    setExito(null);
  };

  const cancelar = () => {
    setEditando(null);
    setIntentado(false);
    setErrorEnvio(null);
  };

  const enviar = async (e, alerta) => {
    e.preventDefault();
    setIntentado(true);
    setErrorEnvio(null);
    if (validarMotivo(motivo)) return;

    setEnviando(true);
    try {
      await onOpenIntervention(alerta, motivo.trim());
      setEditando(null);
      setIntentado(false);
      setExito(alerta.sensorName);
    } catch (err) {
      setErrorEnvio(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="card max-lg:p-4" aria-busy={loading}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 max-lg:mb-2">
        <div>
          <h2 className="card-title">Requieren atención</h2>
          <p className="text-sm text-gray-600">Sensores fuera de rango o sin transmitir</p>
        </div>
        {!loading && alerts.length > 0 && (
          <span className="rounded-full bg-brand-dark px-3 py-1 text-sm font-semibold text-white">
            {alerts.length} {alerts.length === 1 ? 'sensor' : 'sensores'}
          </span>
        )}
      </div>

      {exito && (
        <div className="alert-success mb-3 flex items-center justify-between gap-3" role="status">
          <span>Intervención abierta para {exito}.</span>
          <button type="button" onClick={() => setExito(null)} className="btn btn-ghost btn-sm" aria-label="Cerrar aviso">
            ✕
          </button>
        </div>
      )}

      {loading && <FilasCargando />}

      {/* La carga falló y no hay datos: no se puede afirmar que todo esté bien */}
      {!loading && sinDatos && alerts.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-brand-gray bg-white/60 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gray/60 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <p className="font-semibold text-gray-700">{MENSAJE_SIN_DATOS}</p>
            <p className="text-sm text-gray-600">No es posible saber si hay sensores con problemas. Intenta actualizar.</p>
          </div>
        </div>
      )}

      {/* Estado vacío: todo funciona bien */}
      {!loading && !sinDatos && alerts.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-light bg-white p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light/40 text-brand-dark">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <p className="font-semibold text-brand-dark">Todos los sensores funcionan bien</p>
            <p className="text-sm text-gray-600">No hay alertas activas en este momento.</p>
          </div>
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="overflow-x-auto">
          {/* Entre 768 y 1023 px (proyector) la tabla cabe sin scroll: se oculta la tendencia */}
          <table className="w-full min-w-[640px] text-left md:max-lg:min-w-0">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th scope="col" className="py-2 pr-3 font-semibold">Sensor</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Estado</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Último dato</th>
                <th scope="col" className="py-2 pr-3 font-semibold max-lg:hidden">Tendencia 24 h</th>
                <th scope="col" className="py-2 text-right font-semibold"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alerta) => {
                const abierto = editando === alerta.sensorId;
                const idCampo = `motivo-${alerta.sensorId}`;
                return (
                  <React.Fragment key={alerta.sensorId}>
                    <tr className={`border-t border-brand-gray align-middle ${abierto ? 'bg-white/60' : ''}`}>
                      <td className="py-3 pr-3 max-lg:py-2">
                        <p className="font-semibold text-brand-dark">{alerta.sensorName}</p>
                        <p className="text-sm text-gray-600">{alerta.siteName}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${ESTADOS_SENSOR[alerta.status].chip}`}>
                          {ESTADOS_SENSOR[alerta.status].label}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        {alerta.status === 'out_of_range' ? (
                          <span className="whitespace-nowrap font-bold text-danger">{formatOxygen(alerta.lastValue)}</span>
                        ) : (
                          <span className="whitespace-nowrap text-sm">{timeAgo(alerta.lastAt)}</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 max-lg:hidden">
                        <Sparkline puntos={trends[alerta.sensorId]} minimo={alerta.min} color={ESTADOS_SENSOR[alerta.status].linea} />
                      </td>
                      <td className="py-3">
                        {/* Acciones de la fila, todas con la misma altura */}
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onShowChart(alerta.sensorId)}
                            className="btn btn-secondary btn-sm"
                            title="Ver el gráfico de este sensor"
                          >
                            Ver gráfico
                          </button>
                          {alerta.hasOpenIntervention ? (
                            <span className="inline-flex h-8 items-center whitespace-nowrap rounded-lg bg-brand-light/40 px-3 text-xs font-semibold text-brand-dark">
                              Intervención abierta
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => (abierto ? cancelar() : empezar(alerta))}
                              disabled={abierto && enviando}
                              className={`btn btn-sm min-w-36 ${abierto ? 'btn-secondary' : 'btn-primary'}`}
                              aria-expanded={abierto}
                              aria-controls={abierto ? `form-${alerta.sensorId}` : undefined}
                            >
                              {abierto ? 'Cerrar' : 'Abrir intervención'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Formulario en línea para abrir la intervención de este sensor */}
                    {abierto && (
                      <tr className="bg-white/60">
                        <td colSpan={5} className="px-1 pb-4">
                          <form
                            id={`form-${alerta.sensorId}`}
                            onSubmit={(e) => enviar(e, alerta)}
                            noValidate
                            className="rounded-xl border border-brand-light bg-white p-4 shadow-sm"
                          >
                            <label htmlFor={idCampo} className="field-label">
                              Motivo de la intervención <span className="text-danger">*</span>
                            </label>
                            <textarea
                              id={idCampo}
                              value={motivo}
                              onChange={(e) => setMotivo(e.target.value)}
                              rows={2}
                              className={`input h-auto min-h-16 resize-y py-2 ${errorMotivo ? 'input-error' : ''}`}
                              aria-invalid={Boolean(errorMotivo)}
                              aria-describedby={errorMotivo ? `${idCampo}-error` : `${idCampo}-ayuda`}
                              placeholder="Describe qué se va a revisar o corregir"
                            />
                            <div className="mt-1 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                {errorMotivo ? (
                                  <p id={`${idCampo}-error`} className="field-error" role="alert">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                                    </svg>
                                    {errorMotivo}
                                  </p>
                                ) : (
                                  <p id={`${idCampo}-ayuda`} className="mt-1 text-xs text-gray-500">
                                    Entre {MOTIVO_MIN} y {MOTIVO_MAX} caracteres. Puedes editar el motivo sugerido.
                                  </p>
                                )}
                              </div>
                              <span
                                className={`mt-1 shrink-0 text-xs tabular-nums ${largo > MOTIVO_MAX ? 'font-semibold text-danger' : 'text-gray-500'}`}
                                aria-hidden="true"
                              >
                                {largo}/{MOTIVO_MAX}
                              </span>
                            </div>

                            {errorEnvio && <p className="alert-error mt-3" role="alert">{errorEnvio}</p>}

                            <div className="mt-3 flex flex-wrap justify-end gap-2">
                              <button type="button" onClick={cancelar} disabled={enviando} className="btn btn-secondary">
                                Cancelar
                              </button>
                              <button type="submit" disabled={enviando} className="btn btn-primary">
                                {enviando ? 'Abriendo…' : 'Abrir intervención'}
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
