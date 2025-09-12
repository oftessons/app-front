import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-page-trilha',
  templateUrl: './page-trilha.component.html',
  styleUrls: ['./page-trilha.component.css']
})
export class PageTrilhaComponent implements OnInit {
  selectedTema: string = 'Todos os temas';

  temas: string[] = [
    'Todos os temas',
    'Catarata',
    'Lente de Contato',
    'Glaucoma'
  ];

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}