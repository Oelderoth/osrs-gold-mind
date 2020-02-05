import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter, NextRouter } from 'next/router';
import usePriceSummary from '../hooks/usePriceSummary';
import queryString from 'query-string';

import '../styles.scss';
import ItemHistoryChart from '../components/itemHistoryChart';
import ItemHistoryTable from '../components/itemHistoryTable';
import ConditionalSpan from '../components/conditionalSpan';
import FavoriteStar from '../components/favoriteStar';

function getItemId(router: NextRouter): string | undefined {
    // Since router queries are only populated on SSR and single-page navigations, 
    // we use query-strings to grab itemId query params if they're otherwise unpopulated

    const itemId = router?.query?.id ??
        queryString.parse(router.asPath).id;
    return itemId?.toString();
}


const HighVolume: NextPage = function () {
    const { summary } = usePriceSummary();
    const router = useRouter();
    const itemId = getItemId(router);
    const item = summary?.getItem(itemId?.toString());

    return (
        <div className="section">
            <h1 className="title">
                {item?.name ?? "Unknown Item"}
                <FavoriteStar className="is-pulled-right" id={item?.id} />                    
            </h1>
            <div className="tile is-ancestor">
                <div className="tile item-icon-big">
                    { item && <img className="image is-96x96" src={`http://services.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${item.id}`} /> }
                </div>
                <div className="tile is-vertical is-parent">
                    <div className="tile is-child is-marginless is-flex item-information-row">
                        <span>Current Price</span>
                        <span>{item?.overall_average}</span>
                    </div>
                    <div className="tile is-child is-marginless is-flex item-information-row">
                        <span>Offer Price</span>
                        <span>{item?.sell_average}</span>
                    </div>
                    <div className="tile is-child is-marginless is-flex item-information-row">
                        <span>Sell Price</span>
                        <span>{item?.buy_average}</span>
                    </div>
                    <div className="tile is-child is-marginless is-flex item-information-row">
                        <span>Profit</span>
                        <span><ConditionalSpan value={item?.profit} 
                            threshold={0} 
                            thresholdClasses={['has-text-success', 'has-text-danger']}
                            prefixes={['+','-']}/></span>
                    </div>
                </div>
                <div className="tile is-vertical is-parent">
                    <div className="tile is-child is-marginless is-flex item-information-row">
                        <span>GE Limit</span>
                        <span>N/A</span>
                    </div>
                    <div className="tile is-child is-marginless is-flex item-information-row">
                        <span>Buying Quantity</span>
                        <span>{item?.buy_quantity}</span>
                    </div>
                    <div className="tile is-child is-marginless is-flex item-information-row">
                        <span>Selling Quantity</span>
                        <span>{item?.sell_quantity}</span>
                    </div>
                    <div className="tile is-child is-marginless is-flex item-information-row">
                        <span>Buy/Sell Ratio</span>
                        <span><ConditionalSpan 
                            value={item?.buySellRatio.toFixed(2)} 
                            threshold={1.0}
                            thresholdClasses={['has-text-success', 'has-text-danger']}/></span>
                    </div>
                </div>
            </div>
            <div className="container">
                <ItemHistoryTable id={itemId} />
                <ItemHistoryChart id={itemId} />
            </div>
        </div>
    );
}

export default HighVolume;