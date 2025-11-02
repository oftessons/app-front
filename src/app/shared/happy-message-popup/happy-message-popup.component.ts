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

  message2years: string = "Você completou 2 anos de dedicação e evolução! \n " +
    "Sua jornada de aprendizado e superação é inspiradora. \n " +
    "Que venham mais desafios, vitórias e novos marcos! 🚀"

  @Input() aberto: boolean = false;
  @Input() finalMessage : string = "";
  @Input() icon : string = ''
  @Input() initialMessage : string = "";
   tipo: 'bday' | '6m' | '1a' | '2a' | '30d' | '3m' | '7d' | null = null;


  estiloMensagem3Meses = {
    color: '#E3E3E3',
    fontSize: '1.2rem',
    margin: '1rem 0 0',
    padding: '0 4rem',
    lineHeight: '1.9',
    display: 'flex',
    flexDirection: 'row'
  };


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

        if (res === 1)  this.tipo = 'bday';
        if (res === 6)  this.tipo = '6m';
        if (res === 12) this.tipo = '1a';
        if (res === 24) this.tipo = '2a';
        if (res === 30) this.tipo = '30d';
        if (res === 3)  this.tipo = '3m';
        if (res === 7)  this.tipo = '7d';

        if (!this.tipo) { this.aberto = false; return; }

        if (this.jaMostrouHoje(this.tipo)) {
          this.aberto = false;
          return;
        }

        if (this.tipo === 'bday') {
          this.icon = "assets/imagens/Frame_255.png";
          this.comemoracao = "Feliz Aniversário!";
          this.finalMessage = this.messageBirthday.replace("{{nomeUsuario}}", this.nomeUsuario);
        }else if (this.tipo === '30d') {
          this.icon = "assets/imagens/1_mes.svg";
          this.initialMessage = "Uau! Já faz 1 mês!  🎉  ";
          this.comemoracao = "30 dias de Aprendizado!";
          this.finalMessage = "O tempo voou e você já completou 1 mês nessa jornada de conhecimento! \n " +
            "Continue assim, seu progresso está apenas começando! 💪🔥";
        }else if (this.tipo === '7d') {
          this.icon = "assets/imagens/7_dias.svg";
          this.initialMessage = "Olha só como passou rápido! 🎉 ";
          this.comemoracao = "7 dias de Aprendizado!";
          this.finalMessage = "Já se foram 7 dias desde que você começou essa jornada. \n" +
          "Continue assim e prepare-se para o próximo desafio!🚀";
        }else if (this.tipo === '3m') {
          this.icon = "assets/imagens/3_meses.svg";
          this.initialMessage= "3 meses! 💥 ";
          this.comemoracao = "3 meses de Aprendizado!";
          this.finalMessage = `Três meses de foco e evolução! 🚀
                Você está criando um novo ritmo de conquistas.
                Continue firme, o próximo nível te espera! 🏆`;
        } else if (this.tipo === '6m') {
          this.icon = "assets/imagens/6_meses.svg";
          this.initialMessage = "Parabéns! 🎉  ";
          this.comemoracao = "6 meses de Aprendizado!";
          this.finalMessage = this.message6months;
        } else if (this.tipo === '1a') {
          this.icon = "assets/imagens/1_ano.svg";
          this.initialMessage = "Parabéns! 🎉  ";
          this.comemoracao = "1 ano de Aprendizado!";
          this.finalMessage = this.message1year;
        } else if (this.tipo === '2a') {
          this.icon = "assets/imagens/2_anos.svg";
          this.initialMessage = "Parabéns! 🎉  ";
          this.comemoracao = "2 anos de Aprendizado!";
          this.finalMessage = this.message2years;
        }

        this.aberto = true;
        // this.marcarMostradoHoje(tipo);
      },
      err => console.error('Erro ao verificar comemoração', err)
    );
  }

}
