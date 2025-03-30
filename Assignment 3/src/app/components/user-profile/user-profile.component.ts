import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { User } from '../../model/user';
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  standalone: true,
  imports: [
    DatePipe
  ],
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  token = localStorage.getItem('token');
  decodedToken = JSON.parse(atob(this.token.split('.')[1]));
  username: string = this.decodedToken.username;
  name: string = this.decodedToken.name;
  surname: string = this.decodedToken.surname;
  email: string = this.decodedToken.email;
  address: string = this.decodedToken.address;
  gender: string = this.decodedToken.gender;
  birthdate: Date = this.decodedToken.birthdate;
  admin: boolean = this.decodedToken.admin;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
  }
}
