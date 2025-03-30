import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../service/api.service';
import { Message } from '../../model/message';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-list-message',
  templateUrl: './list-message.component.html',
  styleUrls: ['./list-message.component.scss']
})
export class ListMessageComponent implements OnInit {
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  filterValue: string = '';
  sortValue: string = 'desc';
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  pages: number = 0;
  mode: string;
  messageToDelete: string;

  constructor(private apiService: ApiService, private route: ActivatedRoute, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.mode = params.get('mode');
      if (this.mode === 'inbox') {
        this.loadInboxMessages();
      } else if (this.mode === 'outbox') {
        this.loadOutboxMessages();
      }
    });
  }

  loadInboxMessages() {
    this.apiService.getInbox(this.filterValue, this.sortValue, this.page, this.limit).subscribe(
      (data: any) => {
        this.messages = data.data;
        this.filteredMessages = data.data;
        this.total = data.total;
        this.pages = data.pages;
      },
      (error) => {
        console.error('Error fetching inbox messages:', error);
      }
    );
  }

  loadOutboxMessages() {
    this.apiService.getOutbox(this.filterValue, this.sortValue, this.page, this.limit).subscribe(
      (data: any) => {
        this.messages = data.data;
        this.filteredMessages = data.data;
        this.total = data.total;
        this.pages = data.pages;
      },
      (error) => {
        console.error('Error fetching outbox messages:', error);
      }
    );
  }


  downloadAttachment(filename: string): void {
    let token = localStorage.getItem('token');
    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let url = `http://localhost:4000/api/download/${filename}`;
    this.apiService.downloadAttachment(url, headers).subscribe((blob: Blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }


  filterMessages() {
    if (this.mode === 'inbox') {
      this.loadInboxMessages();
    } else if (this.mode === 'outbox') {
      this.loadOutboxMessages();
    }
  }

  sortMessagesByDate(order: 'asc' | 'desc') {
    this.sortValue = order;
    this.filterMessages();
  }

  confirmDeleteMessage(messageId: string, modal: any) {
    this.messageToDelete = messageId;
    this.modalService.open(modal);
  }

  deleteMessage(modal: any) {
    this.apiService.deleteMessage(this.messageToDelete).subscribe(
      res => {
        this.modalService.dismissAll();
        if (this.mode === 'inbox') {
          this.loadInboxMessages();
        } else if (this.mode === 'outbox') {
          this.loadOutboxMessages();
        }
      },
      err => {
        console.error('Error deleting message:', err);
      }
    );
  }

  changePage(newPage: number) {
    this.page = newPage;
    this.filterMessages();
  }
}
