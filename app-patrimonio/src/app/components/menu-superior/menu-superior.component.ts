import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type MenuLink = {lb: string, url: string}

@Component({
  selector: 'app-menu-superior',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './menu-superior.component.html',
  styleUrl: './menu-superior.component.scss'
})
export class MenuSuperiorComponent {

  readonly menu : MenuLink[] = [
    {
      lb: 'Painel',
      url: '/'
    },
    {
      lb: 'Portifólio',
      url: '/investimento/portifolio'
    },
    {
      lb: 'Ativos',
      url: '/investimento/ativos'
    },
    {
      lb: 'Aportes',
      url: '/aportes'
    },
    {
      lb: 'Contas',
      url: '/patrimonio/contas'
    }
  ]

}
