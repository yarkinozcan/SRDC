import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  submitted = false;
  formType: 'create' | 'edit' | 'register';
  createError: boolean = false;
  createSuccess: boolean = false;
  updateError: boolean = false;
  updateSuccess: boolean = false;
  registerError: boolean = false;
  registerSuccess: boolean = false;
  userId: string;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      if (url.some(segment => segment.path === 'create-user')) {
        this.formType = 'create';
      } else if (url.some(segment => segment.path === 'register')) {
        this.formType = 'register';
      } else if (url.some(segment => segment.path === 'edit-user')) {
        this.formType = 'edit';
        this.userId = this.route.snapshot.paramMap.get('id');
        this.loadUser();
      }
    });
  }

  createForm() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', this.formType !== 'edit' ? Validators.required : Validators.nullValidator],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      gender: ['', Validators.required],
      birthdate: ['', Validators.required],
      admin: [false]
    });
  }

  loadUser() {
    this.apiService.getUser(this.userId).subscribe(user => {
      this.userForm.patchValue(user);
    });
  }

  onSubmit() {
    this.submitted = true;
    this.createError = false;
    this.createSuccess = false;
    this.updateError = false;
    this.updateSuccess = false;
    this.registerError = false;
    this.registerSuccess = false;

    if (this.userForm.invalid) {
      return;
    }

    if (this.formType === 'create') {
      this.apiService.createUser(this.userForm.value).subscribe(
        res => {
          this.createSuccess = true;
          setTimeout(() => {
            this.router.navigate(['/user-list']);
          }, 2000);
        },
        error => {
          this.createError = true;
        }
      );
    } else if (this.formType === 'register') {
      this.apiService.register(this.userForm.value).subscribe(
        res => {
          this.registerSuccess = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error => {
          this.registerError = true;
        }
      );
    } else if (this.formType === 'edit') {
      this.apiService.updateUser(this.userId, this.userForm.value).subscribe(
        res => {
          this.updateSuccess = true;
          setTimeout(() => {
            this.router.navigate(['/user-list']);
          }, 2000);
        },
        error => {
          this.updateError = true;
        }
      );
    }
  }
}
