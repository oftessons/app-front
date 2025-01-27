import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-permissao-professor',
  templateUrl: './permissao-professor.component.html',
  styleUrls: ['./permissao-professor.component.css']
})
export class PermissaoProfessorComponent implements OnInit {

  alunos = [
    { nome: 'Aluno 1', email: 'aluno1@example.com', cidade: 'Cidade 1', estado: 'Estado 1' },
    { nome: 'Aluno 2', email: 'aluno2@example.com', cidade: 'Cidade 2', estado: 'Estado 2' },
    { nome: 'Aluno 3', email: 'aluno3@example.com', cidade: 'Cidade 3', estado: 'Estado 3' },
    { nome: 'Aluno 4', email: 'aluno4@example.com', cidade: 'Cidade 4', estado: 'Estado 4' },
    { nome: 'Aluno 5', email: 'aluno5@example.com', cidade: 'Cidade 5', estado: 'Estado 5' },
    { nome: 'Aluno 6', email: 'aluno6@example.com', cidade: 'Cidade 6', estado: 'Estado 6' },
    { nome: 'Aluno 7', email: 'aluno7@example.com', cidade: 'Cidade 7', estado: 'Estado 7' },
    { nome: 'Aluno 8', email: 'aluno8@example.com', cidade: 'Cidade 8', estado: 'Estado 8' },
    { nome: 'Aluno 9', email: 'aluno9@example.com', cidade: 'Cidade 9', estado: 'Estado 9' },
  ];

  paginatedAlunos = this.alunos.slice(0, 6);
  pageSizeAlunos = 12;
  pageIndexAlunos = 0;
  totalPagesAlunos = Math.ceil(this.alunos.length / this.pageSizeAlunos);

  constructor() { }

  ngOnInit(): void {
    this.updatePaginatedAlunos();
  }

  updatePaginatedAlunos(): void {
    const startIndex = this.pageIndexAlunos * this.pageSizeAlunos;
    const endIndex = startIndex + this.pageSizeAlunos;
    this.paginatedAlunos = this.alunos.slice(startIndex, endIndex);
  }

  nextPageAlunos(): void {
    if (this.pageIndexAlunos < this.totalPagesAlunos - 1) {
      this.pageIndexAlunos++;
      this.updatePaginatedAlunos();
    }
  }

  previousPageAlunos(): void {
    if (this.pageIndexAlunos > 0) {
      this.pageIndexAlunos--;
      this.updatePaginatedAlunos();
    }
  }

  goToPageAlunos(pageIndex: number): void {
    this.pageIndexAlunos = pageIndex;
    this.updatePaginatedAlunos();
  }

}
