import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, delay, of } from "rxjs";
import { Ativo, IAtivo } from "../models/investimento.model";
import { Moeda } from "../models/base.model";

class MockData {
    private _items: Ativo[] = [
        new Ativo({
            moeda: Moeda.BRL,
            sigla: 'ATV1',
            nome: "Ativo 1",
            valor: 1000,
            tipo: "Acao",
        }),
        new Ativo({
            moeda: Moeda.BRL,
            sigla: 'ATV2',
            nome: "Ativo 2",
            valor: 2000,
            tipo: "Acao",
        }),
    ];
    get items() {
        return [...this._items];
    }
    push(ativo: Ativo) {
        this._items.push(ativo);
    }
    remove(ativo: Ativo) {
        this._items = this._items.filter(item => item.identity!== ativo.identity);
    }
}

export type FilterAtivos = {
    termo?: string
}

@Injectable({
    providedIn: 'root'
})
export class AtivoService {
    readonly http = inject(HttpClient);

    mock = new MockData();

    getAtivos(filter?: FilterAtivos): Observable<Ativo[]> {
        console.log(this.mock)
        return of(this.mock.items);
    }
    addAtivo(ativo: IAtivo): Observable<Ativo> {
        const novoAtivo = (<Ativo>ativo).identity ? ativo as Ativo : new Ativo(ativo);
        this.mock.push(novoAtivo);
        console.log(this.mock)
        return of(novoAtivo).pipe(
            delay(1_000)
        );
    }
    updateAtivo(ativo: Ativo): Observable<Ativo> {
        console.log(this.mock)
        return of(ativo).pipe(
            delay(1_000)
        );
    }
    removeAtivo(ativo: Ativo): Observable<Ativo> {
        this.mock.remove(ativo);
        console.log(this.mock)
        return of(ativo).pipe(
            delay(1_000)
        );
    }

}
