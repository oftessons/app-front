import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-playlist-mode',
  templateUrl: './playlist-mode.component.html',
  styleUrls: ['./playlist-mode.component.css'],
})
export class PlaylistModeComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  isModalOpen = false;
  lessons = [
    { title: 'Introdução', completed: false },
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
}
