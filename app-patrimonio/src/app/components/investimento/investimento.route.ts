import { ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'portifolio',
        pathMatch: 'full',
        providers: [
        ]
    },
    {
        path: 'portifolio',
        loadComponent: () => import('./portifolio/protifolio.component').then(m => m.PortifolioComponent)
    },
    {
        path: 'carteira/:id',
        loadComponent: () => import('./carteira/carteira.component').then(m => m.CarteiraComponent)

    },
    {
        path: 'ativos',
        loadComponent: () => import('./ativos-card/ativos-card.component').then(m => m.AtivosCardComponent)
    }
];
