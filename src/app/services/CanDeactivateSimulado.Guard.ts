import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { PageSimuladoComponent } from '../sistema/page-simulado/page-simulado.component';


@Injectable({
    providedIn: 'root',
})
export class CanDeactivateSimuladoGuard implements CanDeactivate<PageSimuladoComponent> {
    canDeactivate(component: PageSimuladoComponent): boolean {
        if (component.isSimuladoIniciado && !component.simuladoFinalizado && !component.revisandoSimulado) {
            const confirmar = confirm(
                'Você está saindo do simulado. Seu progresso será salvo e o simulado será finalizado. Deseja continuar?'
            );

            if (confirmar) {
                component.finalizarSimulado();
                return true; 
            } 
        }
        
        return false; 
    }
}