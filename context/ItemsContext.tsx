import React from 'react';
import usePersistedState, { StringMapper } from '../hooks/usePersistedState';

const PREFIX = 'item-context';
const FAVORITES_KEY = `${PREFIX}-favorites`;

const context = React.createContext({ 
    favorites: new Set<string>(), 
    toggleFavorite: (itemId: string) => { } 
});

const SetMapper: StringMapper<Set<string>>= {
    toString(value:Set<string>): string {
        return JSON.stringify(value);
    },
    fromString(value:string): Set<string> {
        return new Set(JSON.parse(value));
    }
};

const provider = (props) => {
    const [favorites, setFavorites] = usePersistedState(FAVORITES_KEY, new Set(), SetMapper);
    const toggleFavorite = (itemId: string) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(itemId)) {
            newFavorites.delete(itemId);
        } else {
            newFavorites.add(itemId);
        }
        setFavorites(newFavorites);
    }

    return (<context.Provider value={{ favorites: favorites as Set<string>, toggleFavorite: toggleFavorite }}>
        {props.children}
    </context.Provider>);
}

export {context as ItemsContext, provider as ItemsContextProvider}