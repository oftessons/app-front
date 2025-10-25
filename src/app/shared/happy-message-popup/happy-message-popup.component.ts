import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {ParabensService} from "../../services/parabens.service";


@Component({
  selector: 'app-happy-message-popup',
  templateUrl: './happy-message-popup.component.html',
  styleUrls: ['./happy-message-popup.component.css']
})
export class HappyMessagePopupComponent implements OnInit {
  nomeUsuario: string = ""
  comemoracao: string = ""
  messageBirthday: string = "Feliz aniversário, {{nomeUsuario}}! Que seu dia seja repleto de alegria, amor e momentos inesquecíveis. Estamos felizes em celebrar mais um ano de vida ao seu lado!🎉😎"
  message6months: string = "Você completou 6 meses de Oftlessons! \n" +
    "Continue assim e prepare-se para o próximo desafio!"

  message1year: string = "Você completou 1 ano de dedicação e crescimento! \n" +
    "Continue assim e prepare-se para alcançar ainda mais conquistas! 🚀"

  message2years: string = "Você completou 2 anos de dedicação e evolução! \n" +
    "Sua jornada de aprendizado e superação é inspiradora. \n" +
    "Que venham mais desafios, vitórias e novos marcos! 🚀"

  @Input() aberto: boolean = false;
  @Input() finalMessage : string = "";
  @Input() icon : string = ''



  constructor(
    private authService: AuthService,
    private parabensService: ParabensService
  ) { }

  ngOnInit(): void {
    this.obterNomeUsuario();
    this.verifyWhichMessageToShow();
  }

  obterNomeUsuario(): void {
    this.authService.obterNomeUsuario().subscribe(
      nome => this.nomeUsuario = nome,
      err => console.error('Erro ao buscar nome do usuário', err)
    );
    console.log('Nome do usuário obtido:', this.nomeUsuario);
  }

  closePopup(): void {
    this.aberto = false;
  }

  private hojeISO(): string {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  private jaMostrouHoje(tipo: string): boolean {
    const key = `comem-exibida-${tipo}-${this.hojeISO()}`;
    return localStorage.getItem(key) === '1';
  }

  private marcarMostradoHoje(tipo: string): void {
    const key = `comem-exibida-${tipo}-${this.hojeISO()}`;
    localStorage.setItem(key, '1');
  }

  verifyWhichMessageToShow(): void {
    this.parabensService.VerificarComemoracaoHj().subscribe(
      (res: any) => {
        // mapeia o retorno para um “tipo” estável
        let tipo: 'bday' | '6m' | '1a' | '2a' | null = null;

        if (res === 1)  tipo = 'bday';
        if (res === 6)  tipo = '6m';
        if (res === 12) tipo = '1a';
        if (res === 24) tipo = '2a';

        if (!tipo) { this.aberto = false; return; }

        if (this.jaMostrouHoje(tipo)) {
          // já foi mostrado esse tipo hoje, não abre novamente
          this.aberto = false;
          return;
        }

        // monta o conteúdo conforme o tipo
        if (tipo === 'bday') {
          this.icon = "assets/imagens/Frame_255.png";
          this.comemoracao = "Feliz Aniversário!";
          this.finalMessage = this.messageBirthday.replace("{{nomeUsuario}}", this.nomeUsuario);
        } else if (tipo === '6m') {
          this.icon = "assets/imagens/Frame_256.png";
          this.comemoracao = "6 meses de Aprendizado!";
          this.finalMessage = this.message6months;
        } else if (tipo === '1a') {
          this.icon = "assets/imagens/Frame_257.png";
          this.comemoracao = "1 ano de Aprendizado!";
          this.finalMessage = this.message1year;
        } else if (tipo === '2a') {
          this.icon = "assets/imagens/Frame_258.png";
          this.comemoracao = "2 anos de Aprendizado!";
          this.finalMessage = this.message2years;
        }

        this.aberto = true;
        this.marcarMostradoHoje(tipo);
      },
      err => console.error('Erro ao verificar comemoração', err)
    );
  }

}
