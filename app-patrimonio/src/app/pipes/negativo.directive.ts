import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[negativo]'
})
export class NegativoDirective implements OnInit {

  constructor(private el: ElementRef) { }
  
  private _negativo = 0;

  private _original: string | undefined = undefined;

  private _cor : string | undefined  = 'red';

  ngOnInit(): void {
    this._original = this.el.nativeElement.style.color;
  }
  
  public get negativo() {
    return this._negativo;
  }
  
  @Input()
  public set negativo(value) {
    this._negativo = Number(value);
    this.el.nativeElement.style.color = (!!value && value < 0) ? this._cor : this._original;
  }

  public get cor() {
    return this._cor;
  }

  @Input()
  public set cor(value) {
    this._cor = value;
    this.negativo = this._negativo; // força atualização
  }

}
