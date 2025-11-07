import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }



}
