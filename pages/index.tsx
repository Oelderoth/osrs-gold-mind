import React from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../hooks/usePriceSummary';

const Index: NextPage = function () {
    const {summary} = usePriceSummary();

    return (<div>
        {summary?.getItem(44)?.name ?? "Loading..."} <br />
        <ul>
            {summary?.getItems().map(item => <li>{item.name}</li>)}
        </ul>
    </div>);
}

export default Index;