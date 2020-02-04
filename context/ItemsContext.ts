import React from 'react';

const favorites:Set<string> = new Set();

const toggleFavorite = (itemId: string) => {}

const context = React.createContext({favorites, toggleFavorite});

export default context;