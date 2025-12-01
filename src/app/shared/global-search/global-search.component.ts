import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SearchResultResponseDto } from 'src/app/sistema/painel-de-aulas/response/search-result-response-dto';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AulasService } from 'src/app/services/aulas.service';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit {

  resultados: SearchResultResponseDto[] = [];
  mostrarResultados = false;
  isExpanded = false;
  private searchTerms = new Subject<string>();

  @ViewChild('searchInput') searchInput!: ElementRef;
  elementRef: any;

  constructor(
    private router: Router,
    private readonly aulaService: AulasService
  ) { }

  ngOnInit(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.aulaService.pesquisarAulasPorTitulo(term)),
    ).subscribe(results => {
      this.resultados = results;
      this.mostrarResultados = results.length > 0;
    });
  }

  buscar(termo: string): void {
    this.searchTerms.next(termo);
    this.mostrarResultados = !!termo;
  }

  limitarSubtitulo(subtitulo: string): string {
    const maxLength = 10;
    if (subtitulo.length > maxLength) {
      return subtitulo.substring(0, maxLength) + '...';
    }
    return subtitulo;
  }

  generateSlug(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  navegar(slugCategoria: string, slugVideo: string): void {
    this.mostrarResultados = false;
    this.searchInput.nativeElement.value = '';
    this.router.navigate(['/usuario/painel-de-aulas', this.generateSlug(slugCategoria), this.generateSlug(slugVideo)]);
  }

  toggleSearch(): void {
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 100);
    } else {
      this.limparBusca();
    }
  }

  limparBusca(): void {
    this.searchInput.nativeElement.value = '';
    this.resultados = [];
    this.mostrarResultados = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.mostrarResultados = false;

      if (this.searchInput.nativeElement.value === '') {
        this.isExpanded = false;
      }
    }
  }

  onBlur() {
    setTimeout(() => {
      this.isExpanded = false;
      this.resultados = [];
      this.mostrarResultados = false;
    }, 100);
  }

  onFocus(valor: string) {
    if (valor.length >= 2 && this.resultados.length > 0) {
      this.mostrarResultados = true;
    }
  }
}