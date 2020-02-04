import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import ItemsContext from '../context/ItemsContext';

import '../styles.scss';

const favorites = new Set();


const MyApp = ({ Component, pageProps }) => {
    const [favorites, setFavorites] = useState(new Set());
    const toggleFavorite = (itemId: string) => {
        console.log(`toggling ${itemId}`)
        if (favorites.has(itemId)) {
            favorites.delete(itemId);
        } else {
            favorites.add(itemId);
        }
        console.log(favorites);
        setFavorites(new Set(favorites));
    }

    return (<div>
        <ItemsContext.Provider value = {{favorites: favorites as Set<string>, toggleFavorite: toggleFavorite}}>
            <Component {...pageProps} />
        </ItemsContext.Provider>
    </div>);
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default dynamic(() => Promise.resolve(MyApp), { ssr: false })