import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detalhes-planos',
  templateUrl: './detalhes-planos.component.html',
  styleUrls: ['./detalhes-planos.component.css']
})
export class DetalhesPlanosComponent implements OnInit {
  tipoPlano: string = '';
  planos: any[] = [];

  constructor(
    private route: ActivatedRoute, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tipoPlano = params.get('slug') || '';
    });

    // Define os planos com base na URL
    if (this.tipoPlano === 'anual') {
      this.planos = [
        // {
        //   titulo: 'Anual',
        //   descricao: [
        //     'Banco de questões com 4 mil questões.',
        //     '+2500 questões comentadas.',
        //     'Simulados personalizados, cronometrados com base na Prova Nacional de Oftalmologia.',
        //     'Assistente de IA que tira dúvidas e oferece explicações detalhadas.'
        //   ],
        //   preco: 1197.00,
        //   textoAdicional: 'Valor à Vista',
        //   corCabecalho: '#0F1934',
        //   textoParcelas: '',
        //   mostrarPorMes: false,
        //   planoSelecionado: 'assinatura_anual'.toUpperCase()
        // },
        {
          titulo: 'Anual',
          descricao: [
            'Banco de questões com 4 mil questões.',
            '+2500 questões comentadas.',
            'Simulados personalizados, cronometrados com base na Prova Nacional de Oftalmologia.',
            'Assistente de IA que tira dúvidas e oferece explicações detalhadas.'
          ],
          preco: 175.51,
          textoAdicional: 'ou em 1x de R$1.697,00',
          corCabecalho: '#102040',
          textoParcelas: '12x',
          mostrarPorMes: true,
          planoSelecionado: 'assinatura_anual_parcelada'.toUpperCase(),
          planoHotmart: "5089420"
        }
      ];
    } else if (this.tipoPlano === 'semestral') {
      this.planos = [
        // {
        //   titulo: 'Semestral',
        //   descricao: [
        //     'Exploração detalhada do acervo da plataforma.',
        //     'Estudo com tempo para absorver conhecimento.',
        //     'Perfeito para uma aprendizagem profunda e completa.'
        //   ],
        //   preco: 697.00,
        //   textoAdicional: 'Valor a vista',
        //   corCabecalho: '#041E4E',
        //   textoParcelas: '',
        //   mostrarPorMes: false,
        //   planoSelecionado: 'assinatura_semestral'.toUpperCase()
        // },
        {
          titulo: 'Qbank + Mentoria',
          descricao: [
            'Exploração detalhada do acervo da plataforma de +4 mil questões.',
            'Mentoria personalizada para maximizar seu aprendizado.',
            'Acompanhamento mensal com cronograma de estudo e revisões',
            'Fichas de questões personalizadas para guia de estudo'
          ],
          preco: 450.26,
          textoAdicional: 'Ou em 1x de R$2.400,00',
          corCabecalho: '#041E4E',
          textoParcelas: '6x',
          mostrarPorMes: true,
          planoSelecionado: 'assinatura_semestral_parcelada'.toUpperCase(),
          planoHotmart: "5607714"
        }
      ];
    }
  }

  voltar() {
    this.router.navigate(['/planos']);
  }

  onBotaoClicado(): void {
    console.log('Botão do card clicado!');
  }

}
