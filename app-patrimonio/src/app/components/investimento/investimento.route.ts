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
        loadComponent: () => import('./protifolio/protifolio.component').then(m => m.ProtifolioComponent)
    },
    {
        path: 'ativos',
        loadComponent: () => import('./ativos-card/ativos-card.component').then(m => m.AtivosCardComponent)
    }
];
