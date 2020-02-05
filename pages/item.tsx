import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter, NextRouter } from 'next/router';
import usePriceSummary from '../hooks/usePriceSummary';
import queryString from 'query-string';

import '../styles.scss';
import ItemHistoryChart from '../components/itemHistoryChart';
import ItemHistoryTable from '../components/itemHistoryTable';

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
            <h1 className="title">{item?.name ?? "Unknown Item"}</h1>
            <div className="columns">
                <div className="column is-half">
                    <div className="level">
                        <div className="level-left">
                            <div className="level-item">Current Price</div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">{item?.overall_average}</div>
                        </div>
                    </div>
                </div>
                <div className="column is-half">
                    <div className="level">
                        <div className="level-left">
                            <div className="level-item">GE Limit</div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">N/A</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column is-half">
                    <div className="level">
                        <div className="level-left">
                            <div className="level-item">Current Offer Price</div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">{item?.sell_average ?? "N/A"}</div>
                        </div>
                    </div>
                </div>
                <div className="column is-half">
                    <div className="level">
                        <div className="level-left">
                            <div className="level-item">Buy Quanitity</div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">{item?.buy_quantity ?? "N/A"}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column is-half">
                    <div className="level">
                        <div className="level-left">
                            <div className="level-item">Current Sell Price</div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">{item?.buy_average ?? "N/A"}</div>
                        </div>
                    </div>
                </div>
                <div className="column is-half">
                    <div className="level">
                        <div className="level-left">
                            <div className="level-item">Sell Quantity</div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">{item?.sell_quantity ?? "N/A"}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column is-half">
                    <div className="level">
                        <div className="level-left">
                            <div className="level-item">Profit</div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">{item?.profit ?? "N/A"}</div>
                        </div>
                    </div>
                </div>
                <div className="column is-half">
                    <div className="level">
                        <div className="level-left">
                            <div className="level-item">R.O.I.</div>
                        </div>
                        <div className="level-right">
                            <div className="level-item">{item?.returnOnInvestment?.toFixed(2) ?? "N/A"}</div>
                        </div>
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