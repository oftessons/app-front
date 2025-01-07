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
      imageUrl: 'assets/images/catarata.jpg',
      route: 'usuario/modulo-catarata'
    },
    {
      title: 'Cirurgia Refrativa',
      description: 'Conheça as técnicas de cirurgia refrativa.',
      imageUrl: 'assets/images/cirurgia-refrativa.jpg',
      route: 'usuario/modulo-cirurgia-refrativa'
    },
    {
      title: 'Córnea, Conjuntiva e Esclera',
      description: 'Estude os detalhes da córnea, conjuntiva e esclera.',
      imageUrl: 'assets/images/cornea-conjuntiva-esclera.jpg',
      route: 'usuario/modulo-cornea-conjuntiva-esclera'
    },
    {
      title: 'Estrabismo e Oftalmopediatria',
      description: 'Saiba mais sobre estrabismo e oftalmopediatria.',
      imageUrl: 'assets/images/estrabismo-oftalmopediatria.jpg',
      route: 'usuario/modulo-estrabismo-e-oftalmoped'
    },
    {
      title: 'Farmacologia',
      description: 'Explore a farmacologia oftalmológica.',
      imageUrl: 'assets/images/farmacologia.jpg',
      route: 'usuario/modulo-farmacologia'
    },
    {
      title: 'Glaucoma',
      description: 'Compreenda os aspectos do glaucoma.',
      imageUrl: 'assets/images/glaucoma.jpg',
      route: 'usuario/modulo-glaucoma'
    },
    {
      title: 'Lentes de Contato',
      description: 'Descubra o mundo das lentes de contato.',
      imageUrl: 'assets/images/lentes-de-contato.jpg',
      route: 'usuario/modulo-lentes-de-contato'
    },
    {
      title: 'Óptica, Refratometria e Visão Subnormal',
      description: 'Aprenda sobre óptica e visão subnormal.',
      imageUrl: 'assets/images/optica-refratometria-visao-subnormal.jpg',
      route: 'usuario/modulo-optica-refratometria-visao-subnormal'
    },
    {
      title: 'Plástica e Órbita',
      description: 'Estude a plástica ocular e órbita.',
      imageUrl: 'assets/images/plastica-orbita.jpg',
      route: 'usuario/modulo-plastica-e-orbita'
    },
    {
      title: 'Retina',
      description: 'Saiba mais sobre doenças e tratamentos da retina.',
      imageUrl: 'assets/images/retina.jpg',
      route: 'usuario/modulo-retina'
    },
    {
      title: 'Uveíte e Oncologia Ocular',
      description: 'Explore uveítes e oncologia ocular.',
      imageUrl: 'assets/images/uveite-oncologia-ocular.jpg',
      route: 'usuario/modulo-uveite-oncologia-ocular'
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
