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

const routes: Routes = [
  { 
    path: 'usuario', 
    component: LayoutComponent,  
    canActivate: [AuthGuard], 
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'questoes', component: PageQuestoesComponent },
      { path: 'filtro', component: PageFiltroComponent },
      { path: 'desempenho', component: PageDesempenhoComponent },
      { path: 'meu-perfil', component: PageMeuPerfilComponent },
      { path: 'simulados', component: PageSimuladoComponent },
      { path: 'simulados/:id', component: PageSimuladoComponent },
      { path: 'meus-simulados', component: MeusSimuladosComponent },
      { 
        path: 'forbidden', 
        component: ForbiddenComponent // Certifique-se de criar este componente
      },
      { 
        path: 'cadastro-questao', 
        component: CadastroQuestaoComponent, 
        canActivate: [AuthGuard], 
        data: { role: 'ADMIN' }
      },
      { 
        path: 'cadastro-questao/:id', 
        component: CadastroQuestaoComponent, 
        canActivate: [AuthGuard], 
        data: { role: 'ADMIN' }
      },
      { 
        path: 'buscar-questão', 
        component: ListaQuestoesComponent, 
        canActivate: [AuthGuard], 
        data: { role: 'ADMIN' }
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SistemaRoutingModule { }
