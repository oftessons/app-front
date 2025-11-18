import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { PageSimuladoComponent } from '../sistema/page-simulado/page-simulado.component';
import { ModalDeleteService } from './modal-delete.service';


@Injectable({
    providedIn: 'root',
})
export class CanDeactivateSimuladoGuard implements CanDeactivate<PageSimuladoComponent> {
    constructor(private modalDeleteService: ModalDeleteService) {}

    canDeactivate(component: PageSimuladoComponent): Promise<boolean> | boolean {
        if (component.isSimuladoIniciado && !component.simuladoFinalizado && !component.revisandoSimulado) {
            return new Promise<boolean>((resolve) => {
                this.modalDeleteService.openModal(
                    {
                        title: 'Sair do Simulado',
                        description: 'Você está saindo do simulado. Seu progresso será salvo e o simulado será finalizado. Deseja continuar?',
                        deletarTextoBotao: 'Sair',
                        size: 'max-w-xl'
                    },
                    () => {
                        // Confirmou a saída
                        component.finalizarSimulado();
                        resolve(true);
                    },
                    () => {
                        // Cancelou
                        resolve(false);
                    }
                );
            });
        }
        return true; 
    }
}