import { Routes } from '@angular/router';

import { PageAuthComponent } from './core/authentication/pages/page-auth/page-auth.component';
import { TestComponent } from './test/test.component';
import { PageDashboardComponent } from './core/dashboard/pages/page-dashboard/page-dashboard.component';
import { PageTerminalComponent } from './core/terminal/pages/page-terminal/page-terminal.component';
import { PageContainerComponent } from './core/container/pages/page-container/page-container.component';
import { PageStorageComponent } from './core/storage/pages/page-storage/page-storage.component';
import { PageUserComponent } from './core/user/pages/page-user/page-user.component';
import { UserRole } from './core/authentication/services/auth.service';
import { AuthGuard } from './core/authentication/guard/auth.guard';

export const routes: Routes = [
    { path: 'login', component: PageAuthComponent},
    { path: 'register', component: PageAuthComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin] }},
    { path: 'forgot-password', component: PageAuthComponent},
    { path: 'reset-password/:token', component: PageAuthComponent},

    { path: 'test', component: TestComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator] }},

    { path: 'dashboard', component: PageDashboardComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.User] }},
    { path: 'dashboard/:terminalName', component: PageDashboardComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.User] }},
    { path: 'dashboard/:terminalName/users', component: PageDashboardComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator] }},
    { path: 'dashboard/:terminalName/workspace', component: PageDashboardComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.User] }},
    { path: 'dashboard/:terminalName/roles', component: PageDashboardComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator] }},
    
    { path: 'terminal', component: PageTerminalComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin] }},
    { path: 'terminal/:terminalId', component: PageTerminalComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin] }},
    { path: 'all-terminals', component: PageTerminalComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin] }},
    
    { path: 'container', component: PageContainerComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.User] }},
    { path: 'container/:containerId', component: PageContainerComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.User] }},
    { path: 'all-containers', component: PageContainerComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin] }},
    
    { path: 'storage', component: PageStorageComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.User] }},
    { path: 'storage/:storageId', component: PageStorageComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.User] }},
    { path: 'all-storages', component: PageStorageComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin] }},
    
    { path: 'user', component: PageUserComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.User] }},
    { path: 'user/:userId', component: PageUserComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.User] }},
    { path: 'all-users', component: PageUserComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin] }},
];
