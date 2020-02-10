import { useState, Dispatch, SetStateAction } from 'react';

export interface StringMapper<S> {
    toString(val:S):string;
    fromString(val:string):S;
}

const STORAGE = typeof window !== 'undefined' ? (window.sessionStorage) : null;

const loadFromStorage = <S>(key: string, mapper:StringMapper<S>, defaultValue:S):S => {
    console.log(`Loading ${key} from store w/ default value: ${defaultValue}`)
    const val = STORAGE?.getItem(key);
    return  val ? mapper.fromString(val) : defaultValue;
}

const saveToStorage = <S>(key:string, mapper:StringMapper<S>, value:S) => {
    console.log(`Saving ${key} to store w/ value: ${value}`)
    STORAGE?.setItem(key, mapper.toString(value));
}

const DEFAULT_MAPPER:StringMapper<any> = {
    toString(value:any) {
        return JSON.stringify(value);
    },
    fromString(value:string) {
        return JSON.parse(value);
    }
}

export default function usePersistedState<S>(key: string, defaultValue: S, mapper:StringMapper<S> = DEFAULT_MAPPER): [S, Dispatch<SetStateAction<S>>] {
    const [value, dispatch] = useState(() => loadFromStorage(key, mapper, defaultValue));
    return [value, (newValue:S) => {
        saveToStorage(key, mapper, newValue); 
        dispatch(newValue);
    }];
}