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
  selector: 'app-multiplo-select',
  templateUrl: './multiplo-select.component.html',
  styleUrls: ['./multiplo-select.component.css']
})
export class MultiploSelectComponent implements OnInit, OnChanges {
  @Input() label: string = ''; 
  @Input() options: any[] = []; 
  @Input() selectedValue: any[] | any;
  @Output() selectedValueChange = new EventEmitter<any>();
  @Input() customStyles: { [key: string]: string } = {};
  @Input() multiple: boolean = false;
  @Input() searchable: boolean = false;

  searchTerm: string = '';
  isOpen: boolean = false;
  filteredOptions: any[] = [];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Garantir o tipo correto de selectedValue
    if (this.multiple && !Array.isArray(this.selectedValue)) {
      this.selectedValue = [];
    } else if (!this.multiple && Array.isArray(this.selectedValue)) {
      this.selectedValue = null;
    }

    // Inicializa as opções filtradas
    this.filteredOptions = this.options;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.options) {
      // Sempre que 'options' mudar, redefina o filtro
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
      this.filteredOptions = this.options
        .map(group => ({
          ...group,
          options: group.options.filter((opt: any) =>
            normalize(opt.label).includes(term)
          )
        }))
        .filter(group => group.options.length > 0);
    } else {
      this.filteredOptions = this.options.filter((opt: any) => {
        const label = typeof opt === 'string' ? opt : opt.label;
        return normalize(label).includes(term);
      });
    }
  }

  isGroupedOptions(): boolean {
    return Array.isArray(this.options)
      && this.options.length > 0
      && (this.options[0] as any).options !== undefined;
  }

  getLabelFromValue(value: any): string {
    if (this.isGroupedOptions()) {
      for (const group of this.options as any[]) {
        if (group.value === value) {
          return group.label;
        }
        const found = group.options.find((opt: any) => opt.value === value);
        if (found) {
          return found.label;
        }
      }
    }
    // Plano
    const flat = (this.options as any[]).find(opt =>
      opt.value === value || opt === value
    );
    return flat?.label ?? flat ?? '';
  }

  onSelect(value: any): void {
    if (this.multiple) {
      if (!Array.isArray(this.selectedValue)) {
        this.selectedValue = [];
      }
      const idx = this.selectedValue.indexOf(value);
      if (idx !== -1) {
        this.selectedValue = this.selectedValue.filter((v: any) => v !== value);
      } else {
        this.selectedValue = [...this.selectedValue, value];
        this.scrollToBottom();
      }
      this.selectedValueChange.emit(this.selectedValue);
      // manter dropdown aberto em múltipla selecao
      this.isOpen = true;
      this.updateArrowRotation();
    } else {
      this.selectedValue = value;
      this.selectedValueChange.emit(value);
      this.isOpen = false;
      this.updateArrowRotation();
    }
  }

  removeValue(value: any): void {
    if (this.multiple && Array.isArray(this.selectedValue)) {
      this.selectedValue = this.selectedValue.filter((v: any) => v !== value);
      this.selectedValueChange.emit(this.selectedValue);
    }
  }

  scrollToBottom(): void {
    const container: HTMLElement | null = this.elementRef.nativeElement
      .querySelector('.selected-values');
    setTimeout(() => {
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    this.updateArrowRotation();
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
    }
  }
}
