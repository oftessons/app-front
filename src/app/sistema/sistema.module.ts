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
import { ModuloRetinaComponent } from './modulos-das-aulas/modulo-retina/modulo-retina.component';
import { ModuloCorneaConjutivaEscleraComponent } from './modulos-das-aulas/modulo-cornea-conjutiva-esclera/modulo-cornea-conjutiva-esclera.component';
import { ModuloCatarataComponent } from './modulos-das-aulas/modulo-catarata/modulo-catarata.component';
import { ModuloGlaucomaComponent } from './modulos-das-aulas/modulo-glaucoma/modulo-glaucoma.component';
import { ModuloPlasticaEOrbitaComponent } from './modulos-das-aulas/modulo-plastica-e-orbita/modulo-plastica-e-orbita.component';
import { ModuloEstrabismoEOftalmopedComponent } from './modulos-das-aulas/modulo-estrabismo-e-oftalmoped/modulo-estrabismo-e-oftalmoped.component';
import { ModuloCirurgiaRefrativaComponent } from './modulos-das-aulas/modulo-cirurgia-refrativa/modulo-cirurgia-refrativa.component';
import { ModuloLentesDeContatoComponent } from './modulos-das-aulas/modulo-lentes-de-contato/modulo-lentes-de-contato.component';
import { ModuloFarmacologiaComponent } from './modulos-das-aulas/modulo-farmacologia/modulo-farmacologia.component';
import { ModuloOpticaRefratometriaVisaoSubnormalComponent } from './modulos-das-aulas/modulo-optica-refratometria-visao-subnormal/modulo-optica-refratometria-visao-subnormal.component';
import { ModuloUveiteOncologiaOcularComponent } from './modulos-das-aulas/modulo-uveite-oncologia-ocular/modulo-uveite-oncologia-ocular.component';
import { PermissaoAdminComponent } from './permissao-admin/permissao-admin.component';
import { PermissaoProfessorComponent } from './permissao-professor/permissao-professor.component';
import { InicioComponent } from './inicio/inicio.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginaInicialComponent } from './pagina-inicial/pagina-inicial.component';

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
    ModuloRetinaComponent,
    ModuloCorneaConjutivaEscleraComponent,
    ModuloCatarataComponent,
    ModuloGlaucomaComponent,
    ModuloPlasticaEOrbitaComponent,
    ModuloEstrabismoEOftalmopedComponent,
    ModuloCirurgiaRefrativaComponent,
    ModuloLentesDeContatoComponent,
    ModuloFarmacologiaComponent,
    ModuloOpticaRefratometriaVisaoSubnormalComponent,
    ModuloUveiteOncologiaOcularComponent,
    PermissaoAdminComponent,
    PermissaoProfessorComponent,
    InicioComponent,
    PaginaInicialComponent,
    
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
    ReactiveFormsModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA, // Permite o uso de elementos personalizados
  ],
})
export class SistemaModule {}
