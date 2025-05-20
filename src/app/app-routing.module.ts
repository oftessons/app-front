import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './sistema/dashboard/dashboard.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthGuard } from './services/auth.guard';
import { PlanosComponent } from './planos/planos/planos.component';
import { DetalhesPlanosComponent } from './planos/detalhes-planos/detalhes-planos.component';
import { PagamentoConcluidoComponent } from './planos/pagamento-concluido/pagamento-concluido.component';
import { ValidacaoAcessoComponent } from './validacao-acesso/validacao-acesso.component';
import { ChatBotWhatsappComponent } from './chat-bot-whatsapp/chat-bot-whatsapp.component';
import { PaginaInicialComponent } from './sistema/pagina-inicial/pagina-inicial.component';

const routes: Routes = [
  { path: '', component: PaginaInicialComponent },
  { path: 'login', component: LoginComponent },
  { path: 'whatsapp-support', component: ChatBotWhatsappComponent},
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'planos', component: PlanosComponent },
  { path: 'plano/:slug', component: DetalhesPlanosComponent },
  { path: 'pagamento-concluido', component: PagamentoConcluidoComponent },
  { path: '', component: LayoutComponent, children: [
    { path : 'usuario/dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: 'usuario/dashboard', pathMatch: 'full' }
  ]},
  { path: 'validacao-acesso', component: ValidacaoAcessoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
