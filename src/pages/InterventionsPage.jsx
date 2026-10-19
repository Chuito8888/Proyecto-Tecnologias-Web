//Aquí se debería ver la lista de intervenciones 

import React from 'react';
import { InterventionList } from '../components/InterventionList';
import { useInterventions } from '../hooks/useInterventions'; // Importa el hook useInterventions desde useInterventions.js
import { InterventionModal } from '../components/InterventionModal';
import { useLocation } from 'react-router-dom';
//aquí se mostrará el contenido de InterventionList.jsx
export function InterventionsPage() {
  const location = useLocation();
  const siteId = location.state?.siteId ?? '';
  const h = useInterventions(siteId); // Llamada al hook useInterventions para obtener los datos y funciones relacionadas con las intervenciones
  console.log(h.interventions); // Muestra en la consola el objeto devuelto por el hook useInterventions para depuración
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className='flex-1'>
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

      <div className='lg:w-80'>
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

        />
      </div>
    </div>

  );
}