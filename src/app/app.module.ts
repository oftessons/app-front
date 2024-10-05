import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
import { SistemaModule } from './sistema/sistema.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { ChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { EditorModule } from '@tinymce/tinymce-angular';
import { SharedModule } from './shared/shared.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Importando o módulo Quill
import { QuillModule } from 'ngx-quill';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LoginComponent,
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
    QuillModule
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
