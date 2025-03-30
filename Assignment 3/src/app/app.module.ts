import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserLoginComponent } from './components/user-login/user-login.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { CreateMessageComponent } from './components/create-message/create-message.component';
import { ListMessageComponent } from './components/list-message/list-message.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { LogListComponent } from './components/log-list/log-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import {AuthInterceptor} from "./service/auth-interceptor.service";


@NgModule({
  declarations: [
    AppComponent,
    UserListComponent,
    UserLoginComponent,
    CreateMessageComponent,
    ListMessageComponent,
    MainMenuComponent,
    LogListComponent,
    UserFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
