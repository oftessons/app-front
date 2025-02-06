import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Aula } from 'src/app/sistema/painel-de-aulas/aula';

@Component({
  selector: 'app-playlist-mode',
  templateUrl: './playlist-mode.component.html',
  styleUrls: ['./playlist-mode.component.css'],
})
export class PlaylistModeComponent implements OnInit {
  @Input() aulas: Aula[] = [];
  @Input() titulo: string = '';
  @Input() categoria: string = '';
  @Input() videoAtualIndex: number = 0;
  @Output() aulaSelecionada = new EventEmitter<{ aula: Aula, index: number }>();
  @Input() videosAssistidos: boolean[] = [];

  playlistAberta: boolean = true;

  constructor() {}

  ngOnInit(): void {}

  isModalOpen = false;
  lessons = [
    { title: 'Introdução', completed: true },
    { title: 'Subtema de retina', completed: false },
    { title: 'Subtema de retina', completed: false },
  ];

  openModal() {
    this.isModalOpen = true;
  }

  closeModal(event?: MouseEvent) {
    if (!event || event.target === event.currentTarget) {
      this.isModalOpen = false;
    }
  }

  toggleLesson(lesson: any) {
    lesson.completed = !lesson.completed;
  }

  selecionarAula(aula: Aula, index: number): void {
    this.aulaSelecionada.emit({ aula, index });
  }

  togglePlaylist(): void {
    this.playlistAberta = !this.playlistAberta;
  }
}
