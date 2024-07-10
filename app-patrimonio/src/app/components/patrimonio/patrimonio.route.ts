import { Route } from "@angular/router";

export const PatrimonioRoute : Route[] = [
    {
        path: '',
        redirectTo: 'contas',
        pathMatch: 'full'
    },
    {
        path: 'contas',
        loadComponent: () => import('./conta-list/conta-list.component').then(m => m.ContaListComponent)
    }
]