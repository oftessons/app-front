import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from '../layout/layout.component';
import { AuthGuard } from '../services/auth.guard';
import { PageMeuPerfilComponent } from './page-meu-perfil/page-meu-perfil.component';
import { PageQuestoesComponent } from './page-questoes/page-questoes.component';
import { PageFiltroComponent } from './page-filtro/page-filtro.component';
import { PageDesempenhoComponent } from './page-desempenho/page-desempenho.component';

const routes: Routes = [
  {path:'usuario', component: LayoutComponent, children:[
    {path:'dashboard', component: DashboardComponent},
    {path:'questoes', component:PageQuestoesComponent},
    {path:'filtro', component: PageFiltroComponent},
    {path:'desempenho', component: PageDesempenhoComponent},
    {path:'meu-perfil', component: PageMeuPerfilComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SistemaRoutingModule { }
