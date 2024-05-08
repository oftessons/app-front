import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
//import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  //usuarioLogado: string;

  constructor(
    private breakpointObserver: BreakpointObserver,
    //private authService: AuthService,
    private router: Router
    ) { }

  ngOnInit(): void {
    //this.usuarioLogado = this.authService.getUsuarioAutenticado();
    //localStorage.setItem("usuarioLogado",this.usuarioLogado);
  }

  logout(){
    //this.authService.encerrarSessao();
    this.router.navigate(['/login'])
  }


  toggleSidenav(){
     this.sidenav.toggle();
     console.log(this.sidenav.opened)
  }

  isSidenavOpen() {
    return this.breakpointObserver.isMatched('(min-width: 901px)');
  }

  getSidenavMode() {
    return this.breakpointObserver.isMatched('(min-width: 901px)') ? 'side' : 'over';
  }
}
