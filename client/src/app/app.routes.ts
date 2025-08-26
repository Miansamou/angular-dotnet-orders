import { Routes } from '@angular/router';
import { Products } from './features/products/products';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: 'login', loadComponent: () => Login },
    { path: 'register', loadComponent: () => Register },
    { path: 'products', loadComponent: () => Products }
];