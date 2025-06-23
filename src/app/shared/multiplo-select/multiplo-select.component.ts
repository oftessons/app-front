import { Component, Input, HostListener, Output, EventEmitter, ElementRef } from '@angular/core';

@Component({
  selector: 'app-multiplo-select',
  templateUrl: './multiplo-select.component.html',
  styleUrls: ['./multiplo-select.component.css']
})
export class MultiploSelectComponent {
  @Input() label: string = ''; 
  @Input() options: any[] = []; 
  @Input() selectedValue: any[] | any;
  @Output() selectedValueChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() customStyles: { [key: string]: string } = {};
  @Input() multiple: boolean = false;
  @Input() searchable: boolean = false;

  searchTerm: string = '';

  isOpen: boolean = false;
  filteredOptions: any[] = [];


  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.filteredOptions = this.options; // inicialmente sem filtro

    if (this.multiple && (!this.selectedValue || !Array.isArray(this.selectedValue))) {
      this.selectedValue = [];
    } else if (!this.multiple && Array.isArray(this.selectedValue)) {
      this.selectedValue = null;
    }
  }

    onSearchTermChange() {
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
    return Array.isArray(this.options) && this.options.length > 0 && this.options[0]?.options;
  }

  getLabelFromValue(value: any): string {
    if (this.isGroupedOptions()) {
      for (const group of this.options) {
        if (group.value === value) {
          return group.label; // É um tema
        }
        const found = group.options.find((opt: any) => opt.value === value);
        if (found) return found.label; // É um subtema
      }
    }

    // Para lista simples
    const flat = this.options.find((opt: any) => opt.value === value || opt === value);
    return flat?.label ?? flat ?? value;
  }

  onSelect(value: any): void {
    if (this.multiple) {
      if (!Array.isArray(this.selectedValue)) {
        this.selectedValue = [];
      }

      const index = this.selectedValue.indexOf(value);

      if (index !== -1) {
        this.selectedValue = this.selectedValue.filter((item: any) => item !== value);
      } else {
        this.selectedValue = [...this.selectedValue, value];
        this.scrollToBottom();
      }

      this.selectedValueChange.emit(this.selectedValue);
      this.isOpen = true;
    } else {
      this.selectedValue = value;
      this.selectedValueChange.emit(value);
    }
    

  }

  removeValue(value: any): void {
    if (this.multiple && Array.isArray(this.selectedValue)) {
      this.selectedValue = this.selectedValue.filter((item: any) => item !== value);
      this.selectedValueChange.emit(this.selectedValue);
    }
  }

  scrollToBottom(): void {
    const element = this.elementRef.nativeElement.querySelector('.selected-values');
    setTimeout(() => {
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 50);
  }

  private updateArrowRotation(): void {
    const arrowDown = this.elementRef.nativeElement.querySelector('.arrow-down');
    if (this.isOpen) {
      arrowDown.classList.add('rotate');
    } else {
      arrowDown.classList.remove('rotate');
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    this.updateArrowRotation();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.updateArrowRotation();
    }
  }
}