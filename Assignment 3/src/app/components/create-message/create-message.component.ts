import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-create-message',
  templateUrl: './create-message.component.html',
  styleUrls: ['./create-message.component.scss']
})
export class CreateMessageComponent implements OnInit {
  sendMessageForm: FormGroup;
  submitted = false;
  sendSuccess: boolean = false;
  sendError: boolean = false;
  userSuggestions$: Observable<string[]>;
  selectedFile: File = null;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.createForm();
  }

  ngOnInit(): void {
    this.userSuggestions$ = this.sendMessageForm.get('receiver').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.apiService.getUserSuggestions(value).pipe(
        map(users => users.length > 0 ? users : ['No matching users'])
      ))
    );
  }

  createForm() {
    this.sendMessageForm = this.fb.group({
      receiver: ['', Validators.required],
      title: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  get myForm() {
    return this.sendMessageForm.controls;
  }

  onFileChange(event) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    this.submitted = true;
    this.sendSuccess = false;
    this.sendError = false;

    if (this.sendMessageForm.invalid) {
      return;
    }

    const messageData = new FormData();
    messageData.append('sender', JSON.parse(atob(localStorage.getItem('token').split('.')[1])).username);
    messageData.append('receiver', this.sendMessageForm.value.receiver);
    messageData.append('title', this.sendMessageForm.value.title);
    messageData.append('body', this.sendMessageForm.value.body);
    if (this.selectedFile) {
      messageData.append('attachment', this.selectedFile, this.selectedFile.name);
    }

    this.apiService.sendMessage(messageData).subscribe(
      (res) => {
        this.sendSuccess = true;
        this.sendError = false;
        this.sendMessageForm.reset();
      },
      (error) => {
        console.error('Error sending message:', error);
        this.sendError = true;
      }
    );
  }

  // Function for the typeahead
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.apiService.getUserSuggestions(term).pipe(
          map(users => users.length > 0 ? users : ['No matching users'])
        )
      )
    )
}
