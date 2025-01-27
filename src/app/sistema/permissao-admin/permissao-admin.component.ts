import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-permissao-admin',
  templateUrl: './permissao-admin.component.html',
  styleUrls: ['./permissao-admin.component.css'],
})
export class PermissaoAdminComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'email', 'cidade', 'estado'];
  professores = [
    { nome: 'Professor 1', email: 'prof1@example.com', cidade: 'Cidade 1', estado: 'Estado 1' },
    { nome: 'Professor 2', email: 'prof2@example.com', cidade: 'Cidade 2', estado: 'Estado 2' },
    { nome: 'Professor 3', email: 'prof3@example.com', cidade: 'Cidade 3', estado: 'Estado 3' },
    { nome: 'Professor 4', email: 'prof4@example.com', cidade: 'Cidade 4', estado: 'Estado 4' },
    { nome: 'Professor 5', email: 'prof5@example.com', cidade: 'Cidade 5', estado: 'Estado 5' },
    { nome: 'Professor 6', email: 'prof6@example.com', cidade: 'Cidade 6', estado: 'Estado 6' },
    { nome: 'Professor 7', email: 'prof7@example.com', cidade: 'Cidade 7', estado: 'Estado 7' },
    { nome: 'Professor 8', email: 'prof8@example.com', cidade: 'Cidade 8', estado: 'Estado 8' },
    { nome: 'Professor 9', email: 'prof9@example.com', cidade: 'Cidade 9', estado: 'Estado 9' },
  ];

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

  paginatedProfessores = this.professores.slice(0, 6);
  pageSizeProfessores = 6;
  pageIndexProfessores = 0;
  totalPagesProfessores = Math.ceil(this.professores.length / this.pageSizeProfessores);

  paginatedAlunos = this.alunos.slice(0, 6);
  pageSizeAlunos = 6;
  pageIndexAlunos = 0;
  totalPagesAlunos = Math.ceil(this.alunos.length / this.pageSizeAlunos);


  constructor() {}

  ngOnInit(): void {
    this.updatePaginatedData('professores');
    this.updatePaginatedData('alunos');
  }

  updatePaginatedData(type: 'professores' | 'alunos'): void {
    const pageIndex = type === 'professores' ? this.pageIndexProfessores : this.pageIndexAlunos;
    const pageSize = type === 'professores' ? this.pageSizeProfessores : this.pageSizeAlunos;
    const data = type === 'professores' ? this.professores : this.alunos;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    if (type === 'professores') {
      this.paginatedProfessores = data.slice(startIndex, endIndex);
    } else {
      this.paginatedAlunos = data.slice(startIndex, endIndex);
    }
  }

  nextPage(type: 'professores' | 'alunos'): void {
    const pageIndex = type === 'professores' ? this.pageIndexProfessores : this.pageIndexAlunos;
    const totalPages = type === 'professores' ? this.totalPagesProfessores : this.totalPagesAlunos;
    if (pageIndex < totalPages - 1) {
      if (type === 'professores') {
        this.pageIndexProfessores++;
      } else {
        this.pageIndexAlunos++;
      }
      this.updatePaginatedData(type);
    }
  }

  previousPage(type: 'professores' | 'alunos'): void {
    const pageIndex = type === 'professores' ? this.pageIndexProfessores : this.pageIndexAlunos;
    if (pageIndex > 0) {
      if (type === 'professores') {
        this.pageIndexProfessores--;
      } else {
        this.pageIndexAlunos--;
      }
      this.updatePaginatedData(type);
    }
  }

  goToPage(type: 'professores' | 'alunos', pageIndex: number): void {
    if (type === 'professores') {
      this.pageIndexProfessores = pageIndex;
    } else {
      this.pageIndexAlunos = pageIndex;
    }
    this.updatePaginatedData(type);
  }
}
