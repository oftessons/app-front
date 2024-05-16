import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SistemaRoutingModule } from './sistema-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageDesempenhoComponent } from './page-desempenho/page-desempenho.component';
import { PageMeuPerfilComponent } from './page-meu-perfil/page-meu-perfil.component';
import { PageQuestoesComponent } from './page-questoes/page-questoes.component';
import { PageFiltroComponent } from './page-filtro/page-filtro.component';


@NgModule({
  declarations: [
    DashboardComponent,
    PageDesempenhoComponent,
    PageMeuPerfilComponent,
    PageQuestoesComponent,
    PageFiltroComponent
  ],
  imports: [
    CommonModule,
    SistemaRoutingModule
  ]
})
export class SistemaModule { }
