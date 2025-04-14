import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBotWhatsappComponent } from './chat-bot-whatsapp.component';

describe('ChatBotWhatsappComponent', () => {
  let component: ChatBotWhatsappComponent;
  let fixture: ComponentFixture<ChatBotWhatsappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatBotWhatsappComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatBotWhatsappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
