// select-padrao.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-select-padrao',
  templateUrl: './select-padrao.component.html',
  styleUrls: ['./select-padrao.component.css']
})
export class SelectPadraoComponent implements OnInit, OnChanges {
  @Input() label: string = '';
  @Input() options: any[] = []; // Array de Temas, onde cada Tema tem uma propriedade 'options' para subtemas
  @Input() selectedValue: any; // Para seleção única
  @Output() selectedValueChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() customStyles: { [key: string]: string } = {};
  @Input() searchable: boolean = false;

  searchTerm: string = '';
  isOpen: boolean = false;
  filteredOptions: any[] = [];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.filteredOptions = this.options;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
      this.filteredOptions = this.options;
      this.searchTerm = '';
      this.updateArrowRotation();
    }
  }

  onSearchTermChange(): void {
    const normalize = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const term = normalize(this.searchTerm);

    if (this.isGroupedOptions()) {
      // Filtra as opções agrupadas (Tema > Subtema usando a propriedade 'options' do tema)
      this.filteredOptions = this.options
        .map(theme => ({ // 'theme' é o item principal da iteração
          ...theme,
          options: theme.options.filter((subitem: any) => // Filtra os subitens dentro da propriedade 'options' do tema
            normalize(subitem.label).includes(term)
          )
        }))
        .filter(theme => theme.options.length > 0); // Remove temas sem subitens correspondentes após a filtragem
    } else {
      // Filtra opções planas (array de strings ou {label, value})
      this.filteredOptions = this.options.filter((opt: any) => {
        const label = typeof opt === 'string' ? opt : opt.label;
        return normalize(label).includes(term);
      });
    }
  }

  // Verifica se as opções são agrupadas por Tema > Subtema (usando a propriedade 'options' do tema)
  isGroupedOptions(): boolean {
    return (
      Array.isArray(this.options) &&
      this.options.length > 0 &&
      (this.options[0] as any).options !== undefined && // Verifica se o PRIMEIRO item tem 'options'
      Array.isArray((this.options[0] as any).options) // E se essa propriedade 'options' é um array
    );
  }

  // Retorna o label correspondente ao valor selecionado
  getLabelFromValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (this.isGroupedOptions()) {
      for (const theme of this.options as any[]) { // Itera sobre os temas (itens principais)
        // Se o próprio tema for selecionável (opcional e o valor estiver no tema)
        if (theme.value === value) {
          return theme.label;
        }
        // Procura no array de subitens do tema atual (propriedade 'options')
        const foundSubitem = theme.options.find((subitem: any) => subitem.value === value);
        if (foundSubitem) {
          return foundSubitem.label;
        }
      }
    } else {
      // Procura em opções planas
      const found = (this.options as any[]).find(opt =>
        (opt.value !== undefined ? opt.value : opt) === value
      );
      return found?.label ?? found ?? '';
    }
    return ''; // Caso o valor não seja encontrado
  }

  onSelect(value: any): void {
    this.selectedValue = value;
    this.selectedValueChange.emit(value);
    this.isOpen = false;
    this.updateArrowRotation();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    this.updateArrowRotation();
    if (this.isOpen && this.searchable) {
      setTimeout(() => {
        const searchInput = this.elementRef.nativeElement.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
      });
    }
  }

  private updateArrowRotation(): void {
    const arrow = this.elementRef.nativeElement.querySelector('.arrow-down');
    if (arrow) {
      if (this.isOpen) {
        arrow.classList.add('rotate');
      } else {
        arrow.classList.remove('rotate');
      }
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.updateArrowRotation();
      this.searchTerm = '';
      this.filteredOptions = this.options;
    }
  }
}