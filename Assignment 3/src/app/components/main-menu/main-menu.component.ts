import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  name: string = '';

  constructor(private apiService: ApiService,
              private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      this.name = decodedToken.name;
    }
    else{
      this.router.navigate(['/login']);
    }
  }
}
