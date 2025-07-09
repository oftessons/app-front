import { APP_INITIALIZER, NgModule } from '@angular/core'; 
import { BrowserModule } from '@angular/platform-browser';
import { ChatBotComponent } from './chat-bot/chat-bot.component'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TemplateModule } from './template/template.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { AuthService } from './services/auth.service';
import { TokenInterceptor } from './services/token.interceptor';
import { AuthInterceptor } from './services/auth.interceptor';
import { SistemaModule } from './sistema/sistema.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { ChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { EditorModule } from '@tinymce/tinymce-angular';
import { SharedModule } from './shared/shared.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QuillModule } from 'ngx-quill';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PlanosComponent } from './planos/planos/planos.component';
import { DetalhesPlanosComponent } from './planos/detalhes-planos/detalhes-planos.component';
import { PagamentoConcluidoComponent } from './planos/pagamento-concluido/pagamento-concluido.component';
import { ValidacaoAcessoComponent } from './validacao-acesso/validacao-acesso.component';
import { ChatBotWhatsappComponent } from './chat-bot-whatsapp/chat-bot-whatsapp.component';
import { TmplAstRecursiveVisitor } from '@angular/compiler';
import { MarkdownModule } from 'ngx-markdown';




@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LoginComponent,
    ResetPasswordComponent,
    ChatBotComponent,
    PlanosComponent,
    DetalhesPlanosComponent,
    PagamentoConcluidoComponent,
    ValidacaoAcessoComponent,
    ChatBotWhatsappComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TemplateModule,
    HttpClientModule,
    SistemaModule,
    FormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    ChartsModule,
    NgxPaginationModule,
    EditorModule,
    SharedModule,
    MatProgressBarModule,
    MarkdownModule.forRoot(),
    QuillModule.forRoot({
      customOptions: [{
        import: 'formats/font',
        whitelist: ['mirza', 'roboto', 'aref', 'serif', 'sansserif', 'monospace']
      }],
      modules: {
        toolbar: [
          [{ 'color': [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['clean'],
          [{ 'align': [] }],
        ]
      }
    })
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
