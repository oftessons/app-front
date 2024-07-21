import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SistemaRoutingModule } from './sistema-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageDesempenhoComponent } from './page-desempenho/page-desempenho.component';
import { PageMeuPerfilComponent } from './page-meu-perfil/page-meu-perfil.component';
import { PageQuestoesComponent } from './page-questoes/page-questoes.component';
import { PageFiltroComponent } from './page-filtro/page-filtro.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { CadastroQuestaoComponent } from './cadastro-questao/cadastro-questao.component';
import {MatRadioModule} from '@angular/material/radio';
import { ListaQuestoesComponent } from './lista-questoes/lista-questoes.component';
import { PageSimuladoComponent } from './page-simulado/page-simulado.component';


@NgModule({
  declarations: [
    DashboardComponent,
    PageDesempenhoComponent,
    PageMeuPerfilComponent,
    PageQuestoesComponent,
    PageFiltroComponent,
    CadastroQuestaoComponent,
    ListaQuestoesComponent,
    PageSimuladoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SistemaRoutingModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    ChartsModule,
    NgxPaginationModule
  ] , schemas: [
    CUSTOM_ELEMENTS_SCHEMA// Add NO_ERRORS_SCHEMA here
  ]
})
export class SistemaModule { }
