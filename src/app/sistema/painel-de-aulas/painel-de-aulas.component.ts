import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-painel-de-aulas',
  templateUrl: './painel-de-aulas.component.html',
  styleUrls: ['./painel-de-aulas.component.css']
})
export class PainelDeAulasComponent implements OnInit {
  aulas = [
    {
      title: 'Catarata',
      description: 'Entenda tudo sobre catarata.',
      imageUrl: 'assets/imagens/modulo-aula/Catarata.jpeg',
      route: 'usuario/modulo-catarata'
    },
    {
      title: 'Cirurgia Refrativa',
      description: 'Conheça as técnicas de cirurgia refrativa.',
      imageUrl: 'assets/imagens/modulo-aula/Cirurgiarefrativa.webp',
      route: 'usuario/modulo-cirurgia-refrativa'
    },
    {
      title: 'Córnea, Conjuntiva e Esclera',
      description: 'Estude os detalhes da córnea, conjuntiva e esclera.',
      imageUrl: 'assets/imagens/modulo-aula/Cornea.jpeg',
      route: 'usuario/modulo-cornea-conjuntiva-esclera'
    },
    {
      title: 'Estrabismo e Oftalmopediatria',
      description: 'Saiba mais sobre estrabismo e oftalmopediatria.',
      imageUrl: 'assets/imagens/modulo-aula/Estrabismopediatria.webp',
      route: 'usuario/modulo-estrabismo-e-oftalmoped'
    },
    {
      title: 'Farmacologia',
      description: 'Explore a farmacologia oftalmológica.',
      imageUrl: 'assets/imagens/modulo-aula/Farmacologia.jpeg',
      route: 'usuario/modulo-farmacologia'
    },
    {
      title: 'Glaucoma',
      description: 'Compreenda os aspectos do glaucoma.',
      imageUrl: 'assets/imagens/modulo-aula/GLaucoma.jpeg',
      route: 'usuario/modulo-glaucoma'
    },
    {
      title: 'Lentes de Contato',
      description: 'Descubra o mundo das lentes de contato.',
      imageUrl: 'assets/imagens/modulo-aula/Lentedecontato.jpeg',
      route: 'usuario/modulo-lentes-de-contato'
    },
    {
      title: 'Óptica, Refratometria e Visão Subnormal',
      description: 'Aprenda sobre óptica e visão subnormal.',
      imageUrl: 'assets/imagens/modulo-aula/Optica.jpeg',
      route: 'usuario/modulo-optica-refratometria-visao-subnormal'
    },
    {
      title: 'Plástica e Órbita',
      description: 'Estude a plástica ocular e órbita.',
      imageUrl: 'assets/imagens/modulo-aula/OrbitaePlastica.jpeg',
      route: 'usuario/modulo-plastica-e-orbita'
    },
    {
      title: 'Retina',
      description: 'Saiba mais sobre doenças e tratamentos da retina.',
      imageUrl: 'assets/imagens/modulo-aula/Retina.jpeg',
      route: 'usuario/modulo-retina'
    },
    {
      title: 'Uveíte e Oncologia Ocular',
      description: 'Explore uveítes e oncologia ocular.',
      imageUrl: 'assets/imagens/modulo-aula/Uveite.webp',
      route: 'usuario/modulo-uveite-oncologia-ocular'
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
