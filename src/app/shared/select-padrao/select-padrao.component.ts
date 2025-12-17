// select-padrao.compot.ts
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
  @Input() options: any[] = [];
  @Input() selectedValue: any;
  @Output() selectedValueChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() customStyles: { [key: string]: string } = {};
  @Input() searchable: boolean = false;
  @Input() disabled: boolean = false;
  @Input() notDeleteContent: boolean = false;

  searchTerm: string = '';
  isOpen: boolean = false;
  filteredOptions: any[] = [];

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.filteredOptions = this.options;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.disabled) {
      this.isOpen = false;
      this.updateArrowRotation();
    }
    if (changes.options) {
      this.filteredOptions = this.options;
      this.searchTerm = '';
      this.updateArrowRotation();
    }
  }

  onSearchTermChange(): void {
    if (this.disabled) return;

    const normalize = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const term = normalize(this.searchTerm);

    if (this.isGroupedOptions()) {
      this.filteredOptions = this.options
        .map((group: any) => {
          const matchesGroupLabel = normalize(group.label).includes(term);
          const options = matchesGroupLabel
            ? group.options
            : group.options.filter((opt: any) =>
              normalize(opt.label).includes(term)
            );
          return { ...group, options };
        })
        .filter((group: any) => group.options.length > 0 || normalize(group.label).includes(term));
    } else {
      this.filteredOptions = this.options.filter((opt: any) => {
        const label = typeof opt === 'string' ? opt : opt.label;
        return normalize(label).includes(term);
      });
    }
  }

  isGroupedOptions(): boolean {
    return (
      Array.isArray(this.options) &&
      this.options.length > 0 &&
      (this.options[0] as any).options !== undefined &&
      Array.isArray((this.options[0] as any).options)
    );
  }

  removeValue(event: Event): void {
    event.stopPropagation(); 
    if (this.notDeleteContent) return;

    this.selectedValue = null;
    this.selectedValueChange.emit(null);

    this.searchTerm = '';
    this.filteredOptions = this.options;
  }

  getLabelFromValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (this.isGroupedOptions()) {
      for (const theme of this.options as any[]) {
        if (theme.value === value) {
          return theme.label;
        }
        const foundSubitem = theme.options.find((subitem: any) => subitem.value === value);
        if (foundSubitem) {
          return foundSubitem.label;
        }
      }
    } else {
      const found = (this.options as any[]).find(opt =>
        (opt.value !== undefined ? opt.value : opt) === value
      );
      return found?.label ?? found ?? '';
    }
    return '';
  }

  onSelect(value: any): void {
    if (this.disabled) return;

    this.selectedValue = value;
    this.selectedValueChange.emit(value);
    this.isOpen = false;
    this.updateArrowRotation();
  }

  toggleDropdown(): void {
    if (this.disabled) return;
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
    if (this.disabled) return;
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.updateArrowRotation();
      this.searchTerm = '';
      this.filteredOptions = this.options;
    }
  }
}