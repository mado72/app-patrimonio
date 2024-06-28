import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'investimento/portifolio',
        pathMatch: 'full'
    },
    {
        path: 'investimento',
        loadChildren: () => import('./components/investimento/investimento.route').then(m => m.routes)
    }
];
