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
import { ModuloCatarataComponent } from './modulos-das-aulas/modulo-catarata/modulo-catarata.component';
import { ModuloCirurgiaRefrativaComponent } from './modulos-das-aulas/modulo-cirurgia-refrativa/modulo-cirurgia-refrativa.component';
import { ModuloCorneaConjutivaEscleraComponent } from './modulos-das-aulas/modulo-cornea-conjutiva-esclera/modulo-cornea-conjutiva-esclera.component';
import { ModuloEstrabismoEOftalmopedComponent } from './modulos-das-aulas/modulo-estrabismo-e-oftalmoped/modulo-estrabismo-e-oftalmoped.component';
import { ModuloFarmacologiaComponent } from './modulos-das-aulas/modulo-farmacologia/modulo-farmacologia.component';
import { ModuloGlaucomaComponent } from './modulos-das-aulas/modulo-glaucoma/modulo-glaucoma.component';
import { ModuloLentesDeContatoComponent } from './modulos-das-aulas/modulo-lentes-de-contato/modulo-lentes-de-contato.component';
import { ModuloOpticaRefratometriaVisaoSubnormalComponent } from './modulos-das-aulas/modulo-optica-refratometria-visao-subnormal/modulo-optica-refratometria-visao-subnormal.component';
import { ModuloPlasticaEOrbitaComponent } from './modulos-das-aulas/modulo-plastica-e-orbita/modulo-plastica-e-orbita.component';
import { ModuloRetinaComponent } from './modulos-das-aulas/modulo-retina/modulo-retina.component';
import { ModuloUveiteOncologiaOcularComponent } from './modulos-das-aulas/modulo-uveite-oncologia-ocular/modulo-uveite-oncologia-ocular.component';
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


const routes: Routes = [
  { 
    path: 'usuario', 
    component: LayoutComponent,  
    canActivate: [AuthGuard, BolsaGuardService], 
    children: [
      { path: 'inicio', component: InicioComponent},
      { path: 'trilha', component: PageTrilhaComponent },
      { path: 'revisao', component: PageRevisaoComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'questoes', component: PageQuestoesComponent },
      { path: 'flashcards', component: FlashcardsComponent },
      { path: 'filtro', component: PageFiltroComponent },
      { path: 'painel-de-aulas', component: PainelDeAulasComponent},
      { path: 'modulo-catarata', component:ModuloCatarataComponent},
      { path:'modulo-cirurgia-refrativa', component: ModuloCirurgiaRefrativaComponent},
      { path:'modulo-cornea-conjuntiva-esclera', component: ModuloCorneaConjutivaEscleraComponent},
      { path:'modulo-estrabismo-e-oftalmoped', component:ModuloEstrabismoEOftalmopedComponent},
      { path:'modulo-farmacologia', component:ModuloFarmacologiaComponent},
      { path:'modulo-glaucoma', component:ModuloGlaucomaComponent},
      { path:'modulo-lentes-de-contato', component:ModuloLentesDeContatoComponent},
      { path:'modulo-optica-refratometria-visao-subnormal', component:ModuloOpticaRefratometriaVisaoSubnormalComponent},
      { path:'modulo-plastica-e-orbita', component:ModuloPlasticaEOrbitaComponent},
      { path:'modulo-retina', component:ModuloRetinaComponent},
      { path:'modulo-uveite-oncologia-ocular', component:ModuloUveiteOncologiaOcularComponent},
      { path: 'desempenho', component: PageDesempenhoComponent },
      { path: 'minha-conta', component: PageMeuPerfilComponent },
      { path: 'simulados', component: PageSimuladoComponent },
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
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SistemaRoutingModule { }
