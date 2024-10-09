import { Component, Input, HostListener, Output, EventEmitter, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-select-padrao',
  templateUrl: './select-padrao.component.html',
  styleUrls: ['./select-padrao.component.css']
})
export class SelectPadraoComponent {
  @Input() label: string = ''; 
  @Input() options: any[] = []; 
  @Input() selectedValue: any; 
  @Output() selectedValueChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() customStyles: { [key: string]: string } = {};

  isOpen: boolean = false;

  constructor(private elementRef: ElementRef) {}

  onSelect(value: any) {
    this.selectedValue = value;
    this.selectedValueChange.emit(value);
    this.isOpen = false; 
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}