import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './sistema/dashboard/dashboard.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthGuard } from './services/auth.guard';
import { PlanosComponent } from './planos/planos/planos.component';
import { DetalhesPlanosComponent } from './planos/detalhes-planos/detalhes-planos.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'planos', component: PlanosComponent },
  { path: 'plano/:slug', component: DetalhesPlanosComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '', component: LayoutComponent, children: [
    { path : 'usuario/dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: 'usuario/dashboard', pathMatch: 'full' }
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
