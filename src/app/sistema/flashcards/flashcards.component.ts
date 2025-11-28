import { Component, OnInit } from '@angular/core';
import { Tema } from '../page-questoes/enums/tema';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import {
  FlashcardService,
  Flashcard,
} from 'src/app/services/flashcards.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

export interface TemaInfo {
  chave?: string;
  titulo: string;
  qtdFlashcards: number;
  rota: string;
}

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.component.html',
  styleUrls: ['./flashcards.component.css'],
})
export class FlashcardsComponent implements OnInit {
  listaDeTemas: TemaInfo[] = [];
  isLoading: boolean = true;
  totalGeral: number = 0;
  isModalVisible: boolean = false;
  flashcardsEstudo: Flashcard[] = [];
  sessaoId?: number;

  constructor(
    private flashcardService: FlashcardService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarTemas();
  }

  carregarTemas(): void {
    this.isLoading = true;
    this.flashcardService.getFlashcardsContador().subscribe({
      next: (dados) => {
        const temasExcluidos = [
          Tema.NAO_CLASSIFICADA,
          Tema.OUTROS,
          Tema.ICO_PART_1,
          Tema.SBRV,
        ];

        this.listaDeTemas = Object.values(Tema)
          .filter((tema) => !temasExcluidos.includes(tema))
          .map((tema) => {
            const temaInfo = dados.find((info) => info.tema === tema);
            return {
              chave: tema as string,
              titulo: TemaDescricoes[tema] || 'Tema não encontrado',
              qtdFlashcards: temaInfo ? temaInfo.total || 0 : 0,
              rota: `/usuario/flashcards/${(tema as string).toLowerCase()}`,
            };
          });

        this.totalGeral = this.listaDeTemas.reduce(
          (acc, curr) => acc + curr.qtdFlashcards,
          0
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private get isUserAdminOrProfessor(): boolean {
    const token = this.authService.obterToken();
    if (!token) return false;
    try {
      const decodedToken = this.authService.jwtHelper.decodeToken(token);
      const userRoles: string[] =
        decodedToken?.authorities || decodedToken?.roles || [];
      if (userRoles.length === 0) {
        const singleRole = decodedToken?.role;
        return singleRole === 'ADMIN' || singleRole === 'PROFESSOR';
      }
      return (
        userRoles.includes('ADMIN') ||
        userRoles.includes('PROFESSOR') ||
        userRoles.includes('ROLE_ADMIN') ||
        userRoles.includes('ROLE_PROFESSOR')
      );
    } catch {
      return false;
    }
  }

  estudarGeral(): void {
    if (this.totalGeral === 0) return;

    this.isLoading = true;
    const incluirConcluidos = this.isUserAdminOrProfessor;

    this.flashcardService
      .getFlashcardsParaEstudar(
        undefined,
        undefined,
        undefined,
        incluirConcluidos
      )
      .subscribe({
        next: (dto) => {
          if (dto && dto.listaFlashcards && dto.listaFlashcards.length > 0) {
            this.flashcardsEstudo = dto.listaFlashcards;
            this.sessaoId = dto.idSessao;
            this.isModalVisible = true;
          } else {
            alert('Não há flashcards disponíveis.');
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  fecharModal(): void {
    this.isModalVisible = false;
    this.flashcardsEstudo = [];
    this.sessaoId = undefined;
    this.carregarTemas();
  }

  navigateToCadastro(): void {
    this.router.navigate(['/usuario/cadastro-flashcard']);
  }
}
