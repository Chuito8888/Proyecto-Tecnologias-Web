//Formulario para registrar una nueva intervención
//Valida los campos al enviar o al salir de ellos y muestra mensajes claros bajo cada uno

import { useRef } from 'react';
import { MOTIVO_MAX, MOTIVO_MIN } from '../hooks/useInterventions';

//Íconos simples en SVG para no instalar otra librería
function IconoError() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 5h2v7h-2zm0 9h2v2h-2z" />
        </svg>
    );
}

function IconoAviso() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M12 2 1 21h22zm-1 7h2v6h-2zm0 8h2v2h-2z" />
        </svg>
    );
}

function IconoCheck() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
    );
}

//Mensaje de error bajo un campo
function FieldError({ id, mensaje }) {
    if (!mensaje) return null;
    return (
        <p id={id} className="field-error">
            <IconoError />
            {mensaje}
        </p>
    );
}

export function InterventionModal({ form, options, canSubmit, changeField, cancel, submit, formError, sending, ok, errors = {}, blurField = () => {}, warning, submitted = false }) {
    //Referencias para enfocar el primer campo con error
    const tipoRef = useRef(null);
    const siteRef = useRef(null);
    const motivoRef = useRef(null);

    const handleSubmit = (e) => {
        const encontrados = submit(e) ?? {};
        const primero = ['tipo', 'siteId', 'motivo'].find((campo) => encontrados[campo]);
        const refs = { tipo: tipoRef, siteId: siteRef, motivo: motivoRef };
        if (primero) refs[primero].current?.focus();
    };

    const nombre = form.tipo === 'sensor' ? 'Sensor' : 'Centro';
    const largoMotivo = form.motivo.trim().length;
    //El resumen solo aparece tras intentar enviar, los errores en línea se ven al salir del campo
    const hayErrores = submitted && Object.keys(errors).length > 0;

    //Props de accesibilidad comunes para cada campo
    const a11y = (campo) => ({
        'aria-invalid': errors[campo] ? true : undefined,
        'aria-describedby': errors[campo] ? `error-${campo}` : undefined,
    });

    return (
        <form onSubmit={handleSubmit} noValidate className="card flex flex-col gap-4 text-brand-dark max-lg:grid max-lg:grid-cols-2 max-lg:gap-x-4 max-lg:gap-y-3 max-lg:p-4">
            {/* En proyector el formulario va en dos columnas: Tipo y Centro lado a lado */}
            <div className="max-lg:col-span-2 max-lg:flex max-lg:flex-wrap max-lg:items-baseline max-lg:gap-x-3">
                <h2 className="card-title max-lg:text-lg">Nueva intervención</h2>
                <p className="mt-1 text-sm text-gray-600 max-lg:mt-0 max-lg:text-xs">Todos los campos son obligatorios</p>
            </div>

            {/* Resumen de errores, igual de claro que en el login */}
            {hayErrores && (
                <div role="alert" className="alert-error flex items-start gap-2 max-lg:col-span-2">
                    <IconoError />
                    <span>Revisa los campos marcados antes de registrar la intervención.</span>
                </div>
            )}

            {/* Centro o Sensor */}
            <div>
                <label htmlFor="int-tipo" className="field-label">
                    Tipo <span className="text-danger">*</span>
                </label>
                <select
                    id="int-tipo"
                    ref={tipoRef}
                    value={form.tipo}
                    onChange={(e) => changeField('tipo', e.target.value)}
                    onBlur={() => blurField('tipo')}
                    className={`input ${errors.tipo ? 'input-error' : ''}`}
                    {...a11y('tipo')}
                >
                    <option value="centro">Centro</option>
                    <option value="sensor">Sensor</option>
                </select>
                <FieldError id="error-tipo" mensaje={errors.tipo} />
            </div>

            {/* Cuál centro o sensor */}
            <div>
                <label htmlFor="int-site" className="field-label">
                    {nombre} <span className="text-danger">*</span>
                </label>
                <select
                    id="int-site"
                    ref={siteRef}
                    value={form.siteId}
                    onChange={(e) => changeField('siteId', e.target.value)}
                    onBlur={() => blurField('siteId')}
                    className={`input ${errors.siteId ? 'input-error' : ''}`}
                    {...a11y('siteId')}
                >
                    <option value="">Selecciona un {nombre.toLowerCase()}</option>
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <FieldError id="error-siteId" mensaje={errors.siteId} />
                {options.length === 0 && (
                    <p className="mt-1 text-xs text-gray-500">No hay {form.tipo === 'sensor' ? 'sensores' : 'centros'} disponibles para seleccionar.</p>
                )}
            </div>

            {/* Advertencia si ya hay una intervención abierta (no bloquea el envío) */}
            {warning && (
                <div role="status" className="flex items-start gap-2 max-lg:col-span-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-medium text-amber-800">
                    <IconoAviso />
                    <span>{warning}</span>
                </div>
            )}

            {/* Motivo */}
            <div className="max-lg:col-span-2">
                <label htmlFor="int-motivo" className="field-label">
                    Motivo <span className="text-danger">*</span>
                </label>
                <textarea
                    id="int-motivo"
                    ref={motivoRef}
                    value={form.motivo}
                    onChange={(e) => changeField('motivo', e.target.value)}
                    onBlur={() => blurField('motivo')}
                    rows={4}
                    maxLength={MOTIVO_MAX + 50}
                    placeholder={`Describe el motivo (mínimo ${MOTIVO_MIN} caracteres)`}
                    className={`input h-auto resize-y py-2 max-lg:h-16 bajo:h-14! ${errors.motivo ? 'input-error' : ''}`}
                    aria-invalid={errors.motivo ? true : undefined}
                    aria-describedby={`${errors.motivo ? 'error-motivo ' : ''}contador-motivo`}
                />
                <div className="flex items-start justify-between gap-3">
                    <FieldError id="error-motivo" mensaje={errors.motivo} />
                    <span
                        id="contador-motivo"
                        className={`ml-auto mt-1 shrink-0 text-xs tabular-nums ${largoMotivo > MOTIVO_MAX ? 'font-semibold text-danger' : 'text-gray-500'}`}
                    >
                        {largoMotivo}/{MOTIVO_MAX}
                    </span>
                </div>
            </div>

            {/* Avisos del servidor */}
            {formError && (
                <div role="alert" className="alert-error flex items-start gap-2 max-lg:col-span-2">
                    <IconoError />
                    <span>{formError}</span>
                </div>
            )}
            {ok && (
                <div role="status" className="alert-success flex items-start gap-2 max-lg:col-span-2">
                    <IconoCheck />
                    <span>Intervención registrada correctamente.</span>
                </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 border-t border-brand-gray pt-4 max-lg:col-span-2 max-lg:pt-3">
                <button type="button" onClick={cancel} disabled={sending} className="btn btn-secondary">
                    Limpiar
                </button>
                <button type="submit" disabled={!canSubmit} aria-busy={sending} className="btn btn-primary">
                    {sending && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                    )}
                    {sending ? 'Registrando…' : 'Registrar intervención'}
                </button>
            </div>
        </form>
    );
}
