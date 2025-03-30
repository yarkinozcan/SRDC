import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { User } from '../model/user';
import { Message } from '../model/message';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  baseUri: string = 'http://localhost:4000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private nameSubject = new BehaviorSubject<string>(null);

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  isAdmin$ = this.isAdminSubject.asObservable();
  name$ = this.nameSubject.asObservable();

  constructor(private http: HttpClient, ) {}

  sendMessage(data: FormData): Observable<any> {
    let token = localStorage.getItem('token');
    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/send`;
    return this.http.post(url, data, { headers }).pipe(catchError(this.errorMgmt));
  }


  getInbox(filter: string = '', sort: string = 'desc', page: number = 1, limit: number = 10): Observable<any> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/inbox?filter=${filter}&sort=${sort}&page=${page}&limit=${limit}`;
    return this.http.get<Message[]>(url, { headers }).pipe(catchError(this.errorMgmt));
  }

  getOutbox(filter: string = '', sort: string = 'desc', page: number = 1, limit: number = 10): Observable<any> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/outbox?filter=${filter}&sort=${sort}&page=${page}&limit=${limit}`;
    return this.http.get<Message[]>(url, { headers }).pipe(catchError(this.errorMgmt));
  }


  deleteMessage(messageId: string): Observable<any> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/delete/${messageId}`;
    return this.http.delete(url, { headers }).pipe(catchError(this.errorMgmt));
  }

  downloadAttachment(url: string, headers: HttpHeaders): Observable<Blob> {
    return this.http.get(url, { headers: headers, responseType: 'blob' }).pipe(catchError(this.errorMgmt));
  }


  // Register user
  register(data: User): Observable<any> {
    let url = `${this.baseUri}/register`;
    return this.http.post(url, data, { headers: this.headers }).pipe(catchError(this.errorMgmt));
  }

  // Login
  login(data: { username: string; password: string }): Observable<any> {
    let url = `${this.baseUri}/login`;
    return this.http.post(url, data).pipe(
      map((res: any) => {
        localStorage.setItem('token', res.token);
        const token = res.token;
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        this.isAdminSubject.next(decodedToken.admin === true);
        this.isLoggedInSubject.next(true);
        this.nameSubject.next(decodedToken.name);
        return res;
      }),
      catchError(this.errorMgmt)
    );
  }

  getIsAdmin() : boolean {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      if (decodedToken.admin === true) {
        return true;
      }
    }
    return false;
  }

  getIsLoggedIn() : boolean {
    const token = localStorage.getItem('token');
    if (token) {
      return true;
    }
    else{return false;}
  }

  // Logout
  logout(): Observable<any> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/logout`;
    return this.http.post(url, {}, { headers }).pipe(
      map((res) => {
        localStorage.removeItem('token');
        this.isLoggedInSubject.next(false);
        this.isAdminSubject.next(false);
        return res;
      }),
      catchError(this.errorMgmt)
    );
  }

  getUserSuggestions(query: string): Observable<string[]> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/get-usernames`;
    return this.http.get<{ username: string }[]>(url, { headers }).pipe(
      map(response => response.filter(user => user.username.toLowerCase().includes(query.toLowerCase())).map(user => user.username))
    );
  }

  getLogs(filter: string = '', action: string = '', sort: string = 'desc', page: number = 1, limit: number = 10): Observable<any> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/logs?filter=${filter}&action=${action}&sort=${sort}&page=${page}&limit=${limit}`;
    return this.http.get<{ logs: any[], totalLogs: number }>(url, { headers }).pipe(catchError(this.errorMgmt));
  }

  // Create user
  createUser(data: User): Observable<any> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/create-user`;
    return this.http.post(url, data, { headers }).pipe(catchError(this.errorMgmt));
  }

  // Get all users
  getUsers(filter: string = '', admin: string = '', gender: string = '', page: number = 1, limit: number = 10): Observable<any> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/get-all?filter=${filter}&admin=${admin}&gender=${gender}&page=${page}&limit=${limit}`;
    return this.http.get<{ data: User[] }>(url, { headers }).pipe(catchError(this.errorMgmt));
  }

  // Update user
  updateUser(id: string, data: User): Observable<any> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/update-user/${id}`;
    return this.http.put(url, data, { headers }).pipe(catchError(this.errorMgmt));
  }

  // Get user by ID
  getUser(id: string): Observable<User> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/get-user/${id}`;
    return this.http.get<User>(url, { headers }).pipe(catchError(this.errorMgmt));
  }



  // Delete user
  deleteUser(username: string): Observable<any> {
    let token = localStorage.getItem('token');
    let headers = this.headers.set('Authorization', `Bearer ${token}`);
    let url = `${this.baseUri}/delete-user`;
    return this.http.request('delete', url, { headers, body: { username } }).pipe(catchError(this.errorMgmt));
  }

  // Error handling
  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => errorMessage);
  }
}
