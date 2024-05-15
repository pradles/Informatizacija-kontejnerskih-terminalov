import { Routes } from '@angular/router';

import { PageAuthComponent } from './core/authentication/pages/page-auth/page-auth.component';
import { TestComponent } from './test/test.component';
import { PageDashboardComponent } from './core/dashboard/pages/page-dashboard/page-dashboard.component';
import { UserRole } from './core/authentication/services/auth.service';
import { AuthGuard } from './core/authentication/guard/auth.guard';

export const routes: Routes = [
    { path: 'login', component: PageAuthComponent},
    { path: 'register', component: PageAuthComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin] }},
    { path: 'forgot-password', component: PageAuthComponent},
    { path: 'reset-password/:token', component: PageAuthComponent},
    { path: 'test', component: TestComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator] }},
    { path: 'dashboard', component: PageDashboardComponent, canActivate: [AuthGuard], data: { expectedRoles: [UserRole.Admin, UserRole.Moderator, UserRole.User] }},
];
