import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'patrimonio',
        pathMatch: 'full'
    },
    {
        path: 'patrimonio',
        loadComponent: () => import('./components/patrimonio/patrimonio.component').then(m => m.PatrimonioComponent)
    },
    {
        path: 'investimento',
        loadChildren: () => import('./components/investimento/investimento.route').then(m => m.routes)
    }
];
