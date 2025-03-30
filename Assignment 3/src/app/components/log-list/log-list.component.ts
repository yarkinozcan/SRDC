import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-log-list',
  templateUrl: './log-list.component.html',
  styleUrls: ['./log-list.component.scss']
})
export class LogListComponent implements OnInit {
  logs: any[] = [];
  totalLogs: number = 0;
  currentPage: number = 1;
  totalPages: number = 0;
  filter: string = '';
  action: string = '';
  sort: string = 'desc';
  limit: number = 10;

  actions: string[] = ['Login', 'Logout', 'Send Message', 'Update User', 'Create User']; // Add other actions as needed

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.apiService.getLogs(this.filter, this.action, this.sort, this.currentPage, this.limit).subscribe(res => {
      this.logs = res.logs;
      this.totalLogs = res.totalLogs;
      this.totalPages = Math.ceil(this.totalLogs / this.limit);
    }, error => {
      console.error('Error fetching logs:', error);
    });
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page on filter change
    this.fetchLogs();
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    this.fetchLogs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchLogs();
  }

  get pagesToShow(): number[] {
    const pagesToShow = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(i);
    }

    if (startPage > 1) {
      pagesToShow.unshift(1);
      if (startPage > 2) {
        pagesToShow.splice(1, 0, -1); // Represent ellipsis with -1
      }
    }

    if (endPage < this.totalPages) {
      pagesToShow.push(this.totalPages);
      if (endPage < this.totalPages - 1) {
        pagesToShow.splice(pagesToShow.length - 1, 0, -1); // Represent ellipsis with -1
      }
    }

    return pagesToShow;
  }
}
