import { ReactElement, useEffect } from "react";

import router from 'next/router';

export default function Index():ReactElement {
    useEffect(() => {
        router.replace({
            pathname: '/FavoriteItems'
        }, '/favoriteItems')
    }, []);

    return (null);
}