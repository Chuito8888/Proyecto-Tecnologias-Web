//Aquí se deberian ver los centros, es posible que para ver los sensores en detalle se necesite
//Una vista a detalle a raíz de esta

import React from 'react';
import { SiteList } from '../components/SiteList';

//aquí se mostrará el contenido de SiteList.jsx
export function SitesPage() {
  return (
    <div>
      <SiteList />
    </div>
  );
}