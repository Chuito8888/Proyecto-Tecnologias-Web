//Página de intervenciones: historial a la izquierda y formulario de registro a la derecha

import { InterventionList } from '../components/InterventionList';
import { useInterventions } from '../hooks/useInterventions'; // Importa el hook useInterventions desde useInterventions.js
import { InterventionModal } from '../components/InterventionModal';
import { useLocation } from 'react-router-dom';

export function InterventionsPage() {
  //Si se viene desde Centros, se preselecciona ese centro en el formulario
  const location = useLocation();
  const siteId = location.state?.siteId ?? '';
  const h = useInterventions(siteId); // Datos y funciones de las intervenciones

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 text-black max-lg:gap-4 bajo:gap-4">
      {/* Encabezado de página, igual al del Dashboard (más compacto en proyector) */}
      <header className="border-b border-brand-light/60 pb-4 max-lg:pb-2 bajo:pb-2">
        <h1 className="text-3xl font-bold text-brand-dark sm:text-4xl max-lg:text-2xl! bajo:text-2xl!">Intervenciones</h1>
        <p className="mt-1 text-gray-600 max-lg:mt-0 max-lg:text-sm bajo:mt-0 bajo:text-sm">Registra y revisa las intervenciones en centros y sensores</p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 max-lg:gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0">
          <InterventionList
            interventions={h.interventions}
            loading={h.loading}
            error={h.error}
            status={h.status}
            onStatusChange={h.changeStatus}
            page={h.page}
            hasNext={h.hasNext}
            onPageChange={h.setPage}
            sites={h.sites}
          />
        </div>

        {/* Formulario fijo al hacer scroll en pantallas grandes; en proyector va arriba
            para registrar y ver la nueva fila aparecer justo debajo, en la tabla */}
        <div className="lg:sticky lg:top-8 max-lg:order-first">
          <InterventionModal
            form={h.form}
            options={h.options}
            canSubmit={h.canSubmit}
            changeField={h.changeField}
            cancel={h.cancel}
            submit={h.submit}
            formError={h.formError}
            sending={h.sending}
            ok={h.ok}
            errors={h.errors}
            blurField={h.blurField}
            warning={h.warning}
            submitted={h.submitted}
          />
        </div>
      </div>
    </div>
  );
}
