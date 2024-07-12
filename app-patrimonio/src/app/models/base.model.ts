import { BehaviorSubject, map, tap } from "rxjs";

export enum Moeda {
    "BRL" = "BRL",
    "USD" = "USD",
    "USDT" = "USDT"
}

export enum DataStatus {
    Idle = "Idle",
    Processing = "Processing",
    Executed = "Executed",
    Error = "Error"
}


export class UUID {
    value: string;
    constructor(value?: string | UUID) {
        this.value = value?.toString() || crypto.randomUUID();
    }
    toString() {
        return this.value;
    }
}

type ImmutableObject<T> = {
    readonly [K in keyof T]: Immutable<T[K]>;
}

export type Immutable<T> = {
    readonly [K in keyof T]: T[K] extends Function ? T[K] : ImmutableObject<T[K]>;
}

export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};

export class Dictionary<T> {
    [id: string]: T;
}

export function clearDictionary<T>(dictionary: Dictionary<T>): Dictionary<T> {
    Object.keys(dictionary).forEach(key => delete dictionary[key]);
    return dictionary;
}

export class State<T> {
    entities = new Dictionary<T>();
    status = DataStatus.Idle;
    error: any;
}

export class StateBehavior<T> {

    state$ = new BehaviorSubject(new State<T>());
    error = this.state$.pipe(map(s => s.error));
    entities = this.state$.pipe(map(s => s.entities));
    status = this.state$.pipe(map(s => s.status));
    nome!: string;

    constructor(nome: string) {
        this.nome = nome;
    }

    asObservable() {
        return this.state$.asObservable().pipe(
            tap(() => console.log(`Observando ${this.nome}..`))
        );
    }

    setState(state: State<T>) {
        const value = { ...this.state$.value, ...state };
        this.state$.next(value);
    }

    clearError() {
        const error = this.state$.value.error;
        if (error) {
            const state = { ...this.state$.value, status: DataStatus.Idle, error: null };
            this.setState(state);
        }
    }

    countListerners() {
        return this.state$.observers.length
    }

}