import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Carteira } from '../../../models/investimento.model';
import { Dictionary } from '../../../models/base.model';
import { AporteAtivo } from '../../../models/aportes.model';
import { AportesCarteiraCardComponent } from '../aportes-carteira-card/aportes-carteira-card.component';

@Component({
  selector: 'app-aportes-form',
  standalone: true,
  imports: [AportesCarteiraCardComponent],
  templateUrl: './aportes-form.component.html',
  styleUrl: './aportes-form.component.scss'
})
export class AportesFormComponent {

  @Input() carteira!: Carteira;
  @Input() aporte!: number;
  @Input() aportes!: Dictionary<AporteAtivo>;

  @Output() aporteChange = new EventEmitter<number>();

  aporteChanged(aporteAtivo: AporteAtivo) {
    console.log(aporteAtivo);
  }

  saldoChanged(saldo: number) {
    this.aporteChange.emit(saldo);
  }

}
