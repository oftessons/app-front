import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-planos',
  templateUrl: './planos.component.html',
  styleUrls: ['./planos.component.css']
})
export class PlanosComponent implements OnInit {
  modeTeste: boolean = false;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.modeTeste = params['modeTeste'] === 'true';
    });
  }  
  onBotaoClicado(): void {
    console.log('Botão do card clicado!');
  }

}