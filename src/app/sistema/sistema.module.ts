import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

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
import { PermissaoAdminComponent } from './permissao-admin/permissao-admin.component';
import { PermissaoProfessorComponent } from './permissao-professor/permissao-professor.component';
import { InicioComponent } from './inicio/inicio.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginaInicialComponent } from './pagina-inicial/pagina-inicial.component';
import { PageTrilhaComponent } from './page-trilha/page-trilha.component';
import { PageRevisaoComponent } from './page-revisao/page-revisao.component';
import { FlashcardsComponent } from './flashcards/flashcards.component';
import { PageMentoriaComponent } from './page-mentoria/page-mentoria.component';
import { MetricasDetalhadasComponent } from './metricas-detalhadas/metricas-detalhadas.component';
import { SugestaoAlunoDialogComponent } from './sugestao-aluno-dialog/sugestao-aluno-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TemaFlashcardsComponent } from './tema-flashcards/tema-flashcards.component';
import { FlashcardsCadastroComponent } from './flashcards-cadastro/flashcards-cadastro.component';
import { QuillModule } from 'ngx-quill';
import { ModuloDeAulasComponent } from './modulo-de-aulas/modulo-de-aulas.component';
import { NotificacoesComponent } from './notificacoes/notificacoes.component';

// Função necessária para o ngx-lottie
export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    DashboardComponent,
    PageDesempenhoComponent,
    PageTrilhaComponent,
    PageRevisaoComponent,
    FlashcardsComponent,
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
    PermissaoAdminComponent,
    PermissaoProfessorComponent,
    InicioComponent,
    PaginaInicialComponent,
    PageMentoriaComponent,
    MetricasDetalhadasComponent,
    SugestaoAlunoDialogComponent,
    TemaFlashcardsComponent,
    FlashcardsCadastroComponent,
    ModuloDeAulasComponent,
    NotificacoesComponent,
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
    ReactiveFormsModule,
    MatDialogModule,
    QuillModule,
    LottieModule.forRoot({ player: playerFactory }),
  ],

  schemas: [
    CUSTOM_ELEMENTS_SCHEMA, // Permite o uso de elementos personalizados
  ],
})
export class SistemaModule {}
