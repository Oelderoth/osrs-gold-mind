import React, { useContext } from 'react';
import classNames from 'classnames';
import ItemsContext from '../context/ItemsContext';

interface FavoriteStarProps {
    id: string;
}

const FavoriteStar = (props: FavoriteStarProps) => {
    const {favorites, toggleFavorite} = useContext(ItemsContext);
    const {id} = props;

    const isActive = favorites.has(id.toString());
    const classes = classNames({
        "fa-star": true,
        "far": !isActive,
        "fas": isActive
    })

    return (<span className="icon" onClick={()=>toggleFavorite(id)}>
        <i className={classes} />
    </span>)
}

export default FavoriteStar;