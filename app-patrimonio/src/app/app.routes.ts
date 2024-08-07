import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'painel',
        pathMatch: 'full'
    },
    {
        path: 'painel',
        loadComponent: () => import('./components/painel/painel.component').then(m => m.PainelComponent)
    },
    {
        path: 'investimento',
        loadChildren: () => import('./components/investimento/investimento.route').then(m => m.InvestimentoRoutes)
    },
    {
        path: 'patrimonio',
        loadChildren: () => import('./components/patrimonio/patrimonio.route').then(m => m.PatrimonioRoute)
    },
    {
        path: 'aportes',
        loadChildren: () => import('./components/aportes/aportes.route').then(m => m.AportesRoutes)
    }
];
