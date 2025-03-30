import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './service/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  name: string = '';

  constructor(
    private router: Router,
    protected apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.apiService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    this.apiService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

    this.apiService.name$.subscribe(name => {
      this.name = name;
    });

    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      this.name = decodedToken.name || '';
      if (decodedToken.admin === true) {
        this.isAdmin = true;
      }
    }
  }

  navigateToProfile() {
     this.router.navigate(['/profile']);
  }


  logout() {
    this.apiService.logout().subscribe(() => {
      localStorage.removeItem('token');
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.router.navigate(['/login']);
      this.name = '';
    });
  }
}
