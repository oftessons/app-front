import { Component, OnInit } from '@angular/core';
import {OfensivaService} from "../../services/ofensiva.service";

@Component({
  selector: 'app-ofensiva',
  templateUrl: './ofensiva.component.html',
  styleUrls: ['./ofensiva.component.css']
})
export class OfensivaComponent implements OnInit {

 naOfensivaStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  border: '2px solid #28A745',
  display: 'block',
  boxSizing: 'border-box',
  backgroundColor: '#28A745'
};
noOfensivaStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  border: '2px solid #8F97A6',
  display: 'block',
  boxSizing: 'border-box'
};

 checkMarkcontainer = {
   display: 'flex',
   justifyContent: 'center',
   alignItems: 'center',
   width: '100%',
   height: '100%'
 };

  isSemanaFinish: boolean = false;
  diasOfensiva: number = 0;
  naOfensiva: boolean = true;
  segNaOfensiva: boolean = false;
  terNaOfensiva: boolean = false;
  quaNaOfensiva: boolean = false;
  quiNaOfensiva: boolean = false;
  sexNaOfensiva: boolean = false;
  sabNaOfensiva: boolean = false;
  domNaOfensiva: boolean = false;
  contReinicio: number = 7;


  constructor(private ofensivaService:OfensivaService) { }

  ngOnInit(): void {
    // this.darOfensivaDoDia()
    this.carregarOfensivaUsuario();
    this.verificarOfensivaSegunda();
    this.verificarOfensivaTerca();
    this.verificarOfensivaQuarta();
    this.verificarOfensivaQuinta();
    this.verificarOfensivaSexta();
    this.verificarOfensivaSabado();
    this.verificarOfensivaDomingo();
    this.verificarSemanaFinish();
  }


  verificarSemanaFinish() {
    if (this.contReinicio == 7) {
      if (localStorage.getItem('Diasemana') === '1') {
        this.segNaOfensiva = true;
        this.terNaOfensiva = false;
        localStorage.removeItem('terOfensivaActive');
        this.quaNaOfensiva = false;
        localStorage.removeItem('quaOfensivaActive');
        this.quiNaOfensiva = false;
        localStorage.removeItem('quiOfensivaActive');
        this.sexNaOfensiva = false;
        localStorage.removeItem('sexOfensivaActive');
        this.sabNaOfensiva = false;
        localStorage.removeItem('sabOfensivaActive');
        this.domNaOfensiva = false;
        localStorage.removeItem('domOfensivaActive');
      }else if (localStorage.getItem('Diasemana') === '2') {
        this.terNaOfensiva = true;
        this.segNaOfensiva = false;
        localStorage.removeItem('segOfensivaActive');
        this.quaNaOfensiva = false;
        localStorage.removeItem('quaOfensivaActive');
        this.quiNaOfensiva = false;
        localStorage.removeItem('quiOfensivaActive');
        this.sexNaOfensiva = false;
        localStorage.removeItem('sexOfensivaActive');
        this.sabNaOfensiva = false;
        localStorage.removeItem('sabOfensivaActive');
        this.domNaOfensiva = false;
        localStorage.removeItem('domOfensivaActive');
      } else if (localStorage.getItem('Diasemana') === '3') {
        this.quaNaOfensiva = true;
        this.segNaOfensiva = false;
        localStorage.removeItem('segOfensivaActive');
        this.terNaOfensiva = false;
        localStorage.removeItem('terOfensivaActive');
        this.quiNaOfensiva = false;
        localStorage.removeItem('quiOfensivaActive');
        this.sexNaOfensiva = false;
        localStorage.removeItem('sexOfensivaActive');
        this.sabNaOfensiva = false;
        localStorage.removeItem('sabOfensivaActive');
        this.domNaOfensiva = false;
        localStorage.removeItem('domOfensivaActive');
      }else if (localStorage.getItem('Diasemana') === '4') {
        this.quiNaOfensiva = true;
        this.segNaOfensiva = false;
        localStorage.removeItem('segOfensivaActive');
        this.terNaOfensiva = false;
        localStorage.removeItem('terOfensivaActive');
        this.quaNaOfensiva = false;
        localStorage.removeItem('quaOfensivaActive');
        this.sexNaOfensiva = false;
        localStorage.removeItem('sexOfensivaActive');
        this.sabNaOfensiva = false;
        localStorage.removeItem('sabOfensivaActive');
        this.domNaOfensiva = false;
        localStorage.removeItem('domOfensivaActive');
      }else if (localStorage.getItem('Diasemana') === '5') {
        this.sexNaOfensiva = true;
        this.segNaOfensiva = false;
        localStorage.removeItem('segOfensivaActive');
        this.terNaOfensiva = false;
        localStorage.removeItem('terOfensivaActive');
        this.quaNaOfensiva = false;
        localStorage.removeItem('quaOfensivaActive');
        this.quiNaOfensiva = false;
        localStorage.removeItem('quiOfensivaActive');
        this.sabNaOfensiva = false;
        localStorage.removeItem('sabOfensivaActive');
        this.domNaOfensiva = false;
        localStorage.removeItem('domOfensivaActive');
      } else if (localStorage.getItem('Diasemana') === '6') {
        this.sabNaOfensiva = true;
        this.segNaOfensiva = false;
        localStorage.removeItem('segOfensivaActive');
        this.terNaOfensiva = false;
        localStorage.removeItem('terOfensivaActive');
        this.quaNaOfensiva = false;
        localStorage.removeItem('quaOfensivaActive');
        this.quiNaOfensiva = false;
        localStorage.removeItem('quiOfensivaActive');
        this.sexNaOfensiva = false;
        localStorage.removeItem('sexOfensivaActive');
        this.domNaOfensiva = false;
        localStorage.removeItem('domOfensivaActive');
      } else if (localStorage.getItem('Diasemana') === '7') {
        this.domNaOfensiva = true;
        this.segNaOfensiva = false;
        localStorage.removeItem('segOfensivaActive');
        this.terNaOfensiva = false;
        localStorage.removeItem('terOfensivaActive');
        this.quaNaOfensiva = false;
        localStorage.removeItem('quaOfensivaActive');
        this.quiNaOfensiva = false;
        localStorage.removeItem('quiOfensivaActive');
        this.sexNaOfensiva = false;
        localStorage.removeItem('sexOfensivaActive');
        this.sabNaOfensiva = false;
        localStorage.removeItem('sabOfensivaActive');
      }
    }
  }


  verificarOfensivaSegunda() {
    const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, ...
    if (today === 1 && this.naOfensiva) {
      this.segNaOfensiva = true;
      localStorage.setItem('Diasemana', '1');
      localStorage.setItem('segOfensivaActive', 'true');
      return;
    }

    if (today > 1 && this.naOfensiva) { // terça a sábado: segunda já passou nesta semana
      this.segNaOfensiva = localStorage.getItem('segOfensivaActive') === 'true';
      return;
    }
  }

    verificarOfensivaTerca() {
      if (!this.naOfensiva) {
        this.terNaOfensiva = false;
        localStorage.removeItem('terOfensivaActive');
        return;
      }

      const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, 2 = Terça, ...
      if (today === 2 && this.naOfensiva) {
        this.terNaOfensiva = true;
        localStorage.setItem('Diasemana', '2');
        localStorage.setItem('terOfensivaActive', 'true');
        return;
      }

      if (today > 2) { // quarta a sábado: terça já passou nesta semana
        this.terNaOfensiva = localStorage.getItem('terOfensivaActive') === 'true';
        return;
      }
    }

    verificarOfensivaQuarta() {
      if (!this.naOfensiva) {
        this.quaNaOfensiva = false;
        localStorage.removeItem('quaOfensivaActive');
        return;
      }

      const today = new Date().getDay(); // 3 = Quarta
      if (today === 3 && this.naOfensiva) {
        this.quaNaOfensiva = true;
        localStorage.setItem('Diasemana', '3');
        localStorage.setItem('quaOfensivaActive', 'true');
        return;
      }

      if (today > 3) { // quinta a sábado: quarta já passou nesta semana
        this.quaNaOfensiva = localStorage.getItem('quaOfensivaActive') === 'true';
        return;
      }
    }

    verificarOfensivaQuinta() {
      if (!this.naOfensiva) {
        this.quiNaOfensiva = false;
        localStorage.removeItem('quiOfensivaActive');
        return;
      }

      const today = new Date().getDay(); // 4 = Quinta
      if (today === 4 && this.naOfensiva) {
        this.quiNaOfensiva = true;
        localStorage .setItem('Diasemana', '4');
        localStorage.setItem('quiOfensivaActive', 'true');
        return;
      }

      if (today > 4) { // sexta a sábado: quinta já passou nesta semana
        this.quiNaOfensiva = localStorage.getItem('quiOfensivaActive') === 'true';
        return;
      }
    }

    verificarOfensivaSexta() {
      if (!this.naOfensiva) {
        this.sexNaOfensiva = false;
        localStorage.removeItem('sexOfensivaActive');
        return;
      }

      const today = new Date().getDay(); // 5 = Sexta
      if (today === 5 && this.naOfensiva) {
        this.sexNaOfensiva = true;
        localStorage .setItem('Diasemana', '5');
        localStorage.setItem('sexOfensivaActive', 'true');
        return;
      }

      if (today > 5) { // sábado: sexta já passou nesta semana
        this.sexNaOfensiva = localStorage.getItem('sexOfensivaActive') === 'true';
        return;
      }
    }

    verificarOfensivaSabado() {
      if (!this.naOfensiva) {
        this.sabNaOfensiva = false;
        localStorage.removeItem('sabOfensivaActive');
        return;
      }

      const today = new Date().getDay(); // 6 = Sábado
      if (today === 6 && this.naOfensiva) {
        this.sabNaOfensiva = true;
        localStorage .setItem('Diasemana', '6');
        localStorage.setItem('sabOfensivaActive', 'true');
        return;
      }

      if (today > 6) { // normalmente nunca acontece, mas manter padrão
        this.sabNaOfensiva = localStorage.getItem('sabOfensivaActive') === 'true';
        return;
      }
    }

    verificarOfensivaDomingo() {
      if (!this.naOfensiva) {
        this.domNaOfensiva = false;
        localStorage.removeItem('domOfensivaActive');
        return;
      }

      const today = new Date().getDay(); // 0 = Domingo
      if (today === 0 && this.naOfensiva) {
        this.domNaOfensiva = true;
        localStorage .setItem('Diasemana', '7');
        localStorage.setItem('domOfensivaActive', 'true');
        this.sabNaOfensiva = true;
        return;
      }

      if (today > 0) {
        this.domNaOfensiva = localStorage.getItem('domOfensivaActive') === 'true';
        return;
      }
    }

    carregarOfensivaUsuario(){
      this.ofensivaService.carregarOfensiva().subscribe((ofensiva) => {
        console.log(ofensiva);
        this.diasOfensiva = ofensiva.diasOfensiva;
        this.naOfensiva = ofensiva.isOnOfensiva;
        this.contReinicio = ofensiva.contadorReinicio;
      });
    }

    darOfensivaDoDia(){
    this.ofensivaService.darOfensivaDoDia().subscribe((ofensiva) => {
      console.log(ofensiva);
      this.diasOfensiva = ofensiva.diasOfensiva;
      this.naOfensiva = ofensiva.isOnOfensiva;
      this.contReinicio = ofensiva.contadorReinicio;
    }
    );
  }

}
