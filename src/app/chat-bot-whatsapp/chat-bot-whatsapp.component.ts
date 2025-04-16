import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-chat-bot-whatsapp',
  templateUrl: './chat-bot-whatsapp.component.html',
  styleUrls: ['./chat-bot-whatsapp.component.css'],
  animations: [
    trigger('chatBotAnimation', [
      state('closed', style({
        transform: 'translateY(100%)',
        opacity: 0,
        display: 'none'
      })),
      state('open', style({
        transform: 'translateY(0)',
        opacity: 1,
      })),
      transition('closed <=> open', [
        animate('1000ms ease-in-out')
      ]), 
    ]),
  ]
})
export class ChatBotWhatsappComponent implements OnInit, AfterViewInit, OnDestroy {
  isOpen: boolean = false;
  showButton: boolean = true;
  isNavigationBarActive = false;
  userMessage: string = '';
  private navCheckInterval: any;

  @ViewChild('chatBody') chatBody!: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Set up interval to check for navigation bar visibility
    this.navCheckInterval = setInterval(() => {
      this.checkNavigationBar();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.navCheckInterval) {
      clearInterval(this.navCheckInterval);
    }
  }

  private checkNavigationBar(): void {
    // Check if any navigation-fixed elements are visible
    const navElements = document.querySelectorAll('.navigation-fixed');
    this.isNavigationBarActive = navElements.length > 0 && 
      Array.from(navElements).some(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.showButton = false;
    } else {
      setTimeout(() => {
        this.showButton = true;
      }, 2000);
    }
  }

  sendMessage(): void {
    const phoneNumber = '5511920909632';
    const message = 'Olá! Preciso de suporte para a Oftlessons.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(this.userMessage || message)}`;
    this.userMessage = '';
    window.open(whatsappUrl, '_blank');
  }
}