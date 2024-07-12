import { Routes } from "@angular/router";

export const AportesRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'rebalanceamento'
    },
    {
        path: 'rebalanceamento',
        loadComponent: () => import('./rebalanceamento/rebalanceamento.component').then(m => m.RebalanceamentoComponent)
    }
]