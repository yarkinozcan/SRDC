import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLoginComponent } from './components/user-login/user-login.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { CreateMessageComponent } from './components/create-message/create-message.component';
import { ListMessageComponent } from './components/list-message/list-message.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { LogListComponent } from './components/log-list/log-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import {AdminGuard, AuthGuard} from "./guards/admin.guard";
import { UserProfileComponent } from './components/user-profile/user-profile.component';

const routes: Routes = [
  { path: '', component: MainMenuComponent, pathMatch: 'full' },
  { path: 'login', component: UserLoginComponent,canActivate:[AuthGuard] },
  { path: 'register', component: UserFormComponent},
  { path: 'main-menu', component: MainMenuComponent,canActivate:[AuthGuard]},
  { path: 'log-list', component: LogListComponent ,canActivate:[AuthGuard, AdminGuard]},
  { path: 'user-list', component: UserListComponent ,canActivate:[AuthGuard, AdminGuard]},
  { path: 'create-user', component: UserFormComponent ,canActivate:[AuthGuard, AdminGuard]},
  { path: 'edit-user/:id', component: UserFormComponent ,canActivate:[AuthGuard, AdminGuard]},
  { path: 'send-message', component: CreateMessageComponent ,canActivate:[AuthGuard]},
  { path: 'messages/:mode', component: ListMessageComponent ,canActivate:[AuthGuard]},
  { path: 'profile', component: UserProfileComponent, canActivate:[AuthGuard]},
  { path: '**', component: UserLoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
