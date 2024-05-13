import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from '../layout/layout.component';
import { AuthGuard } from '../services/auth.guard';

const routes: Routes = [
  {path:'usuario', component: LayoutComponent,  canActivate: [AuthGuard], children:[
    {path:'dashboard', component: DashboardComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SistemaRoutingModule { }
