import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Categoria } from './enums/categoria';
import { CategoriaDescricoes } from './enums/categoria-descricao';
import { EstatisticasAulasService } from 'src/app/services/estatisticas-aulas.service';

@Component({
  selector: 'app-painel-de-aulas',
  templateUrl: './painel-de-aulas.component.html',
  styleUrls: ['./painel-de-aulas.component.css']
})
export class PainelDeAulasComponent implements OnInit {

  private categoriaImagens: { [key in Categoria]: string } = {
    [Categoria.CATARATA]: 'assets/imagens/modulo-aula/Catarata.jpeg',
    [Categoria.CIRURGIA_REFRATIVA]: 'assets/imagens/modulo-aula/Cirurgiarefrativa.webp',
    [Categoria.CORNEA_CONJUNTIVA_E_ESCLERA]: 'assets/imagens/modulo-aula/Cornea.jpeg',
    [Categoria.ESTRABISMO_E_OFTALMOPEATRIA]: 'assets/imagens/modulo-aula/Estrabismopediatria.webp',
    [Categoria.FARMACOLOGIA]: 'assets/imagens/modulo-aula/Farmacologia.jpeg',
    [Categoria.GLAUCOMA]: 'assets/imagens/modulo-aula/GLaucoma.jpeg',
    [Categoria.LENTES_DE_CONTATO]: 'assets/imagens/modulo-aula/Lentedecontato.jpeg',
    [Categoria.OPTICA_REFRAOMETRIA_E_VISAO_SUBNORMAL]: 'assets/imagens/modulo-aula/Optica.jpeg',
    [Categoria.PLASTICA_E_ORBITA]: 'assets/imagens/modulo-aula/OrbitaePlastica.jpeg',
    [Categoria.RETINA]: 'assets/imagens/modulo-aula/Retina.jpeg',
    [Categoria.UVEITE_E_ONCOLOGIA_OCULAR]: 'assets/imagens/modulo-aula/Uveite.webp',
  };

  aulas = Object.keys(Categoria).map((key) => {
    const categoria = Categoria[key as keyof typeof Categoria];
    const descricao = CategoriaDescricoes[categoria];

    return {
      categoria: categoria,
      title: descricao,
      description: this.getDescriptionText(categoria),
      imageUrl: this.categoriaImagens[categoria],
      slug: this.generateSlug(descricao),
      progresso: 0
    };
  });

  constructor(
    private router: Router,
    private estatisticasAulasService: EstatisticasAulasService
  ) { }

  ngOnInit(): void {
    this.carregarProgressoModulos();
  }

  private carregarProgressoModulos(): void {
    this.estatisticasAulasService.obterProgressoAulas().subscribe({
      next: (progressoMap) => {
        this.aulas.forEach(aula => {
          const progresso = progressoMap.get(this.traduzirCategoria(aula.categoria));

          if (progresso) {
            aula.progresso = progresso;
          }
        });
        console.log('Progresso do usuário carregado e mesclado:', this.aulas);
      },
      error: (err) => {
        console.error('Erro ao carregar progresso do usuário:', err);

      }
    });
  }

  generateSlug(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  private getDescriptionText(categoria: Categoria): string {
    const descriptions: { [key in Categoria]: string } = {
      [Categoria.CATARATA]: 'Entenda tudo sobre catarata.',
      [Categoria.CIRURGIA_REFRATIVA]: 'Conheça as técnicas de cirurgia refrativa.',
      [Categoria.CORNEA_CONJUNTIVA_E_ESCLERA]: 'Estude os detalhes da córnea, conjuntiva e esclera.',
      [Categoria.ESTRABISMO_E_OFTALMOPEATRIA]: 'Saiba mais sobre estrabismo e oftalmopediatria.',
      [Categoria.FARMACOLOGIA]: 'Explore a farmacologia oftalmológica.',
      [Categoria.GLAUCOMA]: 'Compreenda os aspectos do glaucoma.',
      [Categoria.LENTES_DE_CONTATO]: 'Descubra o mundo das lentes de contato.',
      [Categoria.OPTICA_REFRAOMETRIA_E_VISAO_SUBNORMAL]: 'Aprenda sobre óptica e visão subnormal.',
      [Categoria.PLASTICA_E_ORBITA]: 'Estude a plástica ocular e órbita.',
      [Categoria.RETINA]: 'Saiba mais sobre doenças e tratamentos da retina.',
      [Categoria.UVEITE_E_ONCOLOGIA_OCULAR]: 'Explore uveítes e oncologia ocular.',
    };
    return descriptions[categoria] || 'Descrição não disponível';
  }

  private traduzirCategoria(categoria: Categoria): string {
    return CategoriaDescricoes[categoria] || categoria;
  }

  navegarParaAula(slug: string): void {
    this.router.navigate(['/usuario/painel-de-aulas', slug]);
  }
}