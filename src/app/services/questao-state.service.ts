import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Questao } from '../sistema/page-questoes/questao';

@Injectable({
  providedIn: 'root'
})
export class QuestoesStateService {
  private questaoAtualSource = new BehaviorSubject<Questao | null>(null);
  questaoAtual$ = this.questaoAtualSource.asObservable();

  setQuestaoAtual(questao: Questao | null) {
    this.questaoAtualSource.next(questao);
  }

  getQuestaoAtual(): Questao | null {
    return this.questaoAtualSource.getValue();
  }
}