import { Routes } from '@angular/router';

import { PageAuthComponent } from './core/authentication/pages/page-auth/page-auth.component';
import { TestComponent } from './test/test.component';

export const routes: Routes = [
    { path: 'login', component: PageAuthComponent},
    { path: 'register', component: PageAuthComponent},
    { path: 'forgot-password', component: PageAuthComponent},
    { path: 'reset-password/:token', component: PageAuthComponent},
    { path: 'test', component: TestComponent},
];
