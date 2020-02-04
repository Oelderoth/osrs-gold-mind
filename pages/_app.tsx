import React from 'react';
import dynamic from 'next/dynamic';

import '../styles.scss';

const MyApp = ({ Component, pageProps }) => {
    return (<div>
        <Component {...pageProps} />
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