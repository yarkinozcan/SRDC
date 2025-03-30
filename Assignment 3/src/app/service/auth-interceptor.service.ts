import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isAlertShown: boolean = false;

  constructor(private apiService: ApiService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if ((error.status === 401 || error.status === 403) && !this.isAlertShown && token) {
          this.isAlertShown = true;
          this.router.navigate(['/user-login']).then(() => {
            setTimeout(() => {
              if (error.status === 401) {
                alert('Your session has expired or you are not authorized. Please log in again.');
              } else if (error.status === 403) {
                alert('Your account has been deleted. Please contact support.');
              }
              localStorage.removeItem('token');
              this.apiService.logout().subscribe(() => {
                this.router.navigate(['/user-login']);
              });
              this.isAlertShown = false;
            }, 100);
          });
        }
        return throwError(error);
      })
    );
  }
}
