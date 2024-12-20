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
import { MatRadioModule } from '@angular/material/radio';
import { ListaQuestoesComponent } from './lista-questoes/lista-questoes.component';
import { PageSimuladoComponent } from './page-simulado/page-simulado.component';
import { MeusSimuladosComponent } from './meus-simulados/meus-simulados.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { EditorModule } from '@tinymce/tinymce-angular';
import { SharedModule } from '../shared/shared.module';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
import { PainelDeAulasComponent } from './painel-de-aulas/painel-de-aulas.component';
import { CadastroDeAulasComponent } from './cadastro-de-aulas/cadastro-de-aulas.component';

@NgModule({
  declarations: [
    DashboardComponent,
    PageDesempenhoComponent,
    PageMeuPerfilComponent,
    PageQuestoesComponent,
    PageFiltroComponent,
    CadastroQuestaoComponent,
    ListaQuestoesComponent,
    PageSimuladoComponent,
    MeusSimuladosComponent,
    ForbiddenComponent,
    SafeHtmlPipe,
    PainelDeAulasComponent,
    CadastroDeAulasComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatProgressBarModule,
    SistemaRoutingModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    ChartsModule,
    NgxPaginationModule,
    EditorModule,
    SharedModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA, // Permite o uso de elementos personalizados
  ],
})
export class SistemaModule {}
