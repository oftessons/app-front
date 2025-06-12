import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  mostrarMensagemAulas: boolean = false;
  mostrarMensagemFlashcard: boolean = false;
  linkFlashcard: string = 'www.google.com';
  possuiPermissao: boolean = true;


  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.verificarPermissao().subscribe(
      response => this.possuiPermissao = response.accessGranted,
      err => console.error('Erro ao buscar a permissão ', err)
    );
  }

  redirecionarFlashcard() {
    this.authService.obterLinkFlashcard().subscribe((data) => {
      this.linkFlashcard = data.linkFlashcard;
      if(this.linkFlashcard != null && this.linkFlashcard !== '') {
        window.open(this.linkFlashcard, '_blank');
      
      } else {
        window.open('https://www.brainscape.com/', '_blank');

      }

    })

    console.log("nem passei por aqui");
  }
  
  exibirMensagem(tipo: string): void {
    if (tipo === 'aulas') {
      this.mostrarMensagemAulas = true;
      setTimeout(() => {
        this.mostrarMensagemAulas = false;
      }, 3000); // 3 segundos
    } else if (tipo === 'flashcard') {
      this.mostrarMensagemFlashcard = true;
      setTimeout(() => {
        this.mostrarMensagemFlashcard = false;
      }, 3000); //  3 segundos
    }
  }

}
