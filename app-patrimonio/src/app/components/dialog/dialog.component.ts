import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {

  @Input() title = 'Modal title';

  @Input() message = 'Message';

  @Output() onConfirm = new EventEmitter();

  @Output() onCancel = new EventEmitter();
  
  confirm() {
    this.onConfirm.emit();
  }
  
  cancel() {
    this.onCancel.emit();
  }

}
