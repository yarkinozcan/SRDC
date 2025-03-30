import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  loginError: boolean = false;
  loginSuccess: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  createForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    this.loginError = false;
    this.loginSuccess = false;

    if (this.loginForm.invalid) {
      return;
    }

    if (this.loginForm.valid) {
      this.apiService.login(this.loginForm.value).subscribe((res) => {
        this.loginSuccess = true;
        setTimeout(() => {
          this.router.navigate(['/main-menu']);
        }, 2000);
      }, (error) => {
        console.error('Login error:', error);
        this.loginError = true;
        if (error.error.expired) {
          localStorage.removeItem('token'); // Remove expired token
        }
      });
    }
  }
}
