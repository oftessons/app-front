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
        {
          titulo: 'Anual',
          descricao: [
            'Utilize todas as funcionalidades da plataforma.',
            'Melhore seu aprendizado de forma abrangente.',
            'Acesso ao banco de questões com reset duas vezes ao ano.'
          ],
          preco: 1197.00,
          textoAdicional: 'Valor a vista',
          corCabecalho: '#0F1934',
          textoParcelas: '',
          mostrarPorMes: false,
          planoSelecionado: 'assinatura_anual'.toUpperCase()
        },
        {
          titulo: 'Anual',
          descricao: [
            'Utilize todas as funcionalidades da plataforma.',
            'Melhore seu aprendizado de forma abrangente.',
            'Acesso ao banco de questões com reset duas vezes ao ano.'
          ],
          preco: 99.75,
          textoAdicional: 'Preço total R$1,197.00',
          corCabecalho: '#102040',
          textoParcelas: '12x',
          mostrarPorMes: true,
          planoSelecionado: 'assinatura_anual_parcelada'.toUpperCase()
        }
      ];
    } else if (this.tipoPlano === 'semestral') {
      this.planos = [
        {
          titulo: 'Semestral',
          descricao: [
            'Exploração detalhada do acervo da plataforma.',
            'Estudo com tempo para absorver conhecimento.',
            'Perfeito para uma aprendizagem profunda e completa.'
          ],
          preco: 697.00,
          textoAdicional: 'Valor a vista',
          corCabecalho: '#041E4E',
          textoParcelas: '',
          mostrarPorMes: false,
          planoSelecionado: 'assinatura_semestral'.toUpperCase()
        },
        {
          titulo: 'Semestral',
          descricao: [
            'Exploração detalhada do acervo da plataforma.',
            'Estudo com tempo para absorver conhecimento.',
            'Perfeito para uma aprendizagem profunda e completa.'
          ],
          preco: 116.16,
          textoAdicional: 'Preço total R$697,00',
          corCabecalho: '#041E4E',
          textoParcelas: '6x',
          mostrarPorMes: true,
          planoSelecionado: 'assinatura_semestral_parcelada'.toUpperCase()
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
