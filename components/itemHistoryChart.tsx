import React, { ReactElement, useState, Fragment } from 'react';
import useItemPriceHistory from '../hooks/useItemPriceHistory';
import { OsBuddyItemHistoryEntry } from '../types/osbuddy';
import { Line, Bar } from 'react-chartjs-2';
import classNames from 'classnames';

import '../styles.scss';

interface ItemHistoryChartProps {
    id: number | string;
}

interface TimeSpanButtonProps{
    label: string;
    timeSpan: number;
    currentTimeSpan: number;
    setTimeSpan: (n: number) => any;
}

const chartOptions = {
    scales: {
        xAxes: [{
            type: 'time',
            time: {
                unit: 'day'
            }
        }]
    },
    tooltips: {
        mode: 'index',
        intersect: false
    },
    hover: {
        mode: 'index',
        intersect: false
    },
    animation: {
        duration: 0
    }
}

function buildGraphDatasets(history: OsBuddyItemHistoryEntry[]) {
    const defaultStyle = {
        fill: false,
        lineTension: 0.25,
        pointHoverRadius: 5,
        pointRadius: 3,
        spanGaps: true
    };

    const priceDataset = {
        datasets: [
            {
                ...defaultStyle,
                label: 'Sell Price',
                borderColor: 'rgba(240, 150, 113,1)',
                data: history?.filter(entry => entry.buyingPrice > 0).map(entry => ({ t: new Date(entry.ts), y: entry.buyingPrice })).slice(0,32) ?? []
            },
            {
                ...defaultStyle,
                label: 'Offer Price',
                borderColor: 'rgba(113, 151, 240,1)',
                data: history?.filter(entry => entry.sellingPrice > 0).map(entry => ({ t: new Date(entry.ts), y: entry.sellingPrice })).slice(0,32) ?? []
            }
        ]
    };

    const quantityDataset = {
        datasets: [
            {
                ...defaultStyle,
                label: 'Sell Quantity',
                borderColor: 'rgba(240, 150, 113,1)',
                backgroundColor: 'rgba(240, 150, 113,0.4)',
                data: history?.filter(entry => entry.buyingPrice > 0).map(entry => ({ t: new Date(entry.ts), y: entry.sellingQuantity })).slice(0,32) ?? []
            },
            {
                ...defaultStyle,
                label: 'Buy Quantity',
                borderColor: 'rgba(113, 151, 240,1)',
                backgroundColor: 'rgba(113, 151, 240, 0.4)',
                data: history?.filter(entry => entry.sellingPrice > 0).map(entry => ({ t: new Date(entry.ts), y: entry.buyingQuantity })).slice(0,32) ?? []
            }
        ]
    }

    return [priceDataset, quantityDataset];
}

const TimeSpanButton = (props: TimeSpanButtonProps): ReactElement => {
    const {label, timeSpan, currentTimeSpan, setTimeSpan} = props;
    return (<p className="control">
        <button className={classNames({
                button: true,
                'is-active': timeSpan === currentTimeSpan
            })} onClick={() => setTimeSpan(timeSpan)}>
            {label}
        </button>
    </p>
    );
}

const ItemHistoryChart = function (props: ItemHistoryChartProps): ReactElement {
    const [timeSpan, setTimeSpan] = useState(30);
    const { history } = useItemPriceHistory(props.id, timeSpan);
    const [priceDataset, quantityDataset] = buildGraphDatasets(history)

    return (
        <Fragment>
            <div className="is-pulled-right field has-addons">
                <TimeSpanButton label="Quarter" timeSpan={4320} setTimeSpan={setTimeSpan} currentTimeSpan={timeSpan}/>
                <TimeSpanButton label="Month" timeSpan={1440} setTimeSpan={setTimeSpan} currentTimeSpan={timeSpan}/>
                <TimeSpanButton label="Week" timeSpan={180} setTimeSpan={setTimeSpan} currentTimeSpan={timeSpan}/>
                <TimeSpanButton label="Day" timeSpan={30} setTimeSpan={setTimeSpan} currentTimeSpan={timeSpan}/>
            </div>
            <Line height={50} data={priceDataset} options={chartOptions} />
            <Bar height={50}data={quantityDataset} options={chartOptions} />
        </Fragment>
    );
}

export default ItemHistoryChart;