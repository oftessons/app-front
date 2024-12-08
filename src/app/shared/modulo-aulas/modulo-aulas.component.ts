import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modulo-aulas',
  templateUrl: './modulo-aulas.component.html',
  styleUrls: ['./modulo-aulas.component.css']
})
export class ModuloAulasComponent implements OnInit {

  @Input() title: string = 'Título do Card';
  @Input() description: string = 'Descrição do Card';
  @Input() imageUrl: string = '';
  @Input() buttonText: string = 'Acessar conteúdo';
  @Input() route: string = '/';

  constructor(private router: Router) {}

  ngOnInit(): void {
  }

  navigateToRoute(): void {
    this.router.navigate([this.route]);
  }

}
