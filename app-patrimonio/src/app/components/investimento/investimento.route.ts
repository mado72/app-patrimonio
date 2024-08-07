import { Routes } from '@angular/router';

export const InvestimentoRoutes: Routes = [
    {
        path: '',
        redirectTo: 'portifolio',
        pathMatch: 'full',
        providers: [
        ]
    },
    {
        path: 'portifolio',
        loadComponent: () => import('./portifolio/portifolio.component').then(m => m.PortifolioComponent)
    },
    {
        path: 'carteira/:id',
        loadComponent: () => import('./carteira/carteira.component').then(m => m.CarteiraComponent)

    },
    {
        path: 'ativos',
        loadComponent: () => import('./ativos-card/ativos-card.component').then(m => m.AtivosCardComponent)
    },
    {
        path: 'alocacoes',
        loadComponent: () => import('./alocacao/alocacao.component').then(m => m.AlocacaoComponent)
    }
];
