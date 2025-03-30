import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { User } from '../../model/user';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  filterValue: string = '';
  adminFilter: string = '';
  genderFilter: string = '';
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  pages: number = 0;
  userToDelete: User | null = null;

  constructor(private apiService: ApiService, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.readUser();
  }

  readUser() {
    this.apiService.getUsers(this.filterValue, this.adminFilter, this.genderFilter, this.page, this.limit).subscribe((data: any) => {
      this.users = data.data;
      this.filteredUsers = data.data;
      this.total = data.total;
      this.pages = data.pages;
    });
  }

  openDeleteModal(content: any, user: User) {
    this.userToDelete = user;
    this.modalService.open(content, { centered: true });
  }

  confirmDelete(modal: any) {
    if (this.userToDelete) {
      this.apiService.deleteUser(this.userToDelete.username).subscribe(() => {
        this.filteredUsers = this.filteredUsers.filter(user => user.username !== this.userToDelete!.username);
        modal.close();
        this.userToDelete = null;
      });
    }
  }

  filterUsers() {
    this.page = 1; // Reset to first page when filtering
    this.readUser();
  }

  changePage(newPage: number) {
    this.page = newPage;
    this.readUser();
  }
}
