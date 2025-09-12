import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { AnimationOptions } from 'ngx-lottie';

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

  eyeAnimationOptions: AnimationOptions = {
    path: 'assets/animations/eye-animation.json',
    loop: true,
    autoplay: true
  };

  eyeLockedOptions: AnimationOptions = {
    path: 'assets/animations/eye-animation.json',
    loop: false,
    autoplay: false
  };

  eyeCompletedOptions: AnimationOptions = {
    path: 'assets/animations/eye-animation.json',
    loop: false,
    autoplay: false
  };

  eyeProgressOptions: AnimationOptions = {
    path: 'assets/animations/eye-animation.json',
    loop: false,
    autoplay: false
  };

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
  }

  obterOpcoesAnimacao(status: string): AnimationOptions {
    switch (status) {
      case 'concluido':
        return this.eyeCompletedOptions;
      case 'andamento':
        return this.eyeProgressOptions;
      case 'bloqueado':
        return this.eyeLockedOptions;
      default:
        return this.eyeAnimationOptions;
    }
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}