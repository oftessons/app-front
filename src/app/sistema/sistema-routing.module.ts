import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from '../layout/layout.component';
import { AuthGuard } from '../services/auth.guard';
import { PageMeuPerfilComponent } from './page-meu-perfil/page-meu-perfil.component';
import { PageQuestoesComponent } from './page-questoes/page-questoes.component';
import { PageFiltroComponent } from './page-filtro/page-filtro.component';
import { PageDesempenhoComponent } from './page-desempenho/page-desempenho.component';
import { CadastroQuestaoComponent } from './cadastro-questao/cadastro-questao.component';
import { ListaQuestoesComponent } from './lista-questoes/lista-questoes.component';
import { PageSimuladoComponent } from './page-simulado/page-simulado.component';
import { MeusSimuladosComponent } from './meus-simulados/meus-simulados.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { PainelDeAulasComponent } from './painel-de-aulas/painel-de-aulas.component';
import { CadastroDeAulasComponent } from './cadastro-de-aulas/cadastro-de-aulas.component';
import { PermissaoAdminComponent } from './permissao-admin/permissao-admin.component';
import { PermissaoProfessorComponent } from './permissao-professor/permissao-professor.component';
import { InicioComponent } from './inicio/inicio.component';
import { PageTrilhaComponent } from './page-trilha/page-trilha.component';
import { PageRevisaoComponent } from './page-revisao/page-revisao.component';
import { PageMentoriaComponent } from './page-mentoria/page-mentoria.component';
import { FlashcardsComponent } from './flashcards/flashcards.component';
import { BolsaGuardService } from '../services/bolsa.guard';
import { MetricasDetalhadasComponent } from './metricas-detalhadas/metricas-detalhadas.component';
import { TemaFlashcardsComponent } from './tema-flashcards/tema-flashcards.component';
import { FlashcardsCadastroComponent } from './flashcards-cadastro/flashcards-cadastro.component';
import { CanDeactivateSimuladoGuard } from '../services/CanDeactivateSimulado.Guard';
import { ModuloDeAulasComponent } from './modulo-de-aulas/modulo-de-aulas.component';


const routes: Routes = [
  {
    path: 'usuario',
    component: LayoutComponent,
    canActivate: [AuthGuard, BolsaGuardService],
    children: [
      { path: 'inicio', component: InicioComponent },
      { path: 'trilha', component: PageTrilhaComponent },
      { path: 'revisao', component: PageRevisaoComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'questoes', component: PageQuestoesComponent },
      { path: 'flashcards', component: FlashcardsComponent },
      { path: 'filtro', component: PageFiltroComponent },
      { path: 'painel-de-aulas', component: PainelDeAulasComponent },
      // { path: 'modulo-catarata', component:ModuloDeAulasComponent},
      // { path:'modulo-cirurgia-refrativa', component: ModuloDeAulasComponent},
      // { path:'modulo-cornea-conjuntiva-esclera', component: ModuloDeAulasComponent},
      // { path:'modulo-estrabismo-e-oftalmoped', component:ModuloDeAulasComponent},
      // { path:'modulo-farmacologia', component:ModuloDeAulasComponent},
      // { path:'modulo-glaucoma', component:ModuloDeAulasComponent},
      // { path:'modulo-lentes-de-contato', component:ModuloDeAulasComponent},
      // { path:'modulo-optica-refratometria-visao-subnormal', component:ModuloDeAulasComponent},
      // { path:'modulo-plastica-e-orbita', component:ModuloDeAulasComponent},
      // { path:'modulo-retina', component:ModuloDeAulasComponent},
      // { path:'modulo-uveite-oncologia-ocular', component:ModuloDeAulasComponent},
      { path: 'painel-de-aulas/:modulo', component: ModuloDeAulasComponent },
      { path: 'desempenho', component: PageDesempenhoComponent },
      { path: 'minha-conta', component: PageMeuPerfilComponent },
      { path: 'simulados', component: PageSimuladoComponent, canDeactivate: [CanDeactivateSimuladoGuard] },
      { path: 'simulados/:id', component: PageSimuladoComponent },
      { path: 'meus-simulados', component: MeusSimuladosComponent },
      { path: 'flashcards/:temaId', component: TemaFlashcardsComponent },
      {
        path: 'forbidden',
        component: ForbiddenComponent // Certifique-se de criar este componente
      },
      {
        path: 'cadastro-questao',
        component: CadastroQuestaoComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'PROFESSOR'] }
      },
      {
        path: 'cadastro-questao/:id',
        component: CadastroQuestaoComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'PROFESSOR'] }
      },
      {
        path: 'cadastro-aulas',
        component: CadastroDeAulasComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'PROFESSOR'] }
      },
      {
        path: 'cadastro-aulas/:id',
        component: CadastroDeAulasComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'PROFESSOR'] }
      },
      {
        path: 'buscar-questão',
        component: ListaQuestoesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'PROFESSOR'] }
      },
      {
        path: 'permissao-admin',
        component: PermissaoAdminComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      {
        path: 'permissao-professor',
        component: PermissaoProfessorComponent,
        canActivate: [AuthGuard],
        data: { role: 'PROFESSOR' }
      },
      {
        path: 'sistema-mentoria',
        component: PageMentoriaComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'PROFESSOR'] }
      },
      {
        path: 'metricas-detalhadas/:id',
        component: MetricasDetalhadasComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'PROFESSOR', 'USER'] }
      },
      {
        path: 'cadastro-flashcard',
        component: FlashcardsCadastroComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'PROFESSOR'] }
      },
      {
        path: 'cadastro-flashcard/:id',
        component: FlashcardsCadastroComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN', 'PROFESSOR'] }
      }

    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SistemaRoutingModule { }
