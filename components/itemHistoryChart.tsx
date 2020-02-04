import React, { ReactElement, useState } from 'react';
import useItemPriceHistory from '../hooks/useItemPriceHistory';
import { OsBuddyItemHistoryEntry } from '../types/osbuddy';
import { Line } from 'react-chartjs-2';
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

function buildGraphDataset(history: OsBuddyItemHistoryEntry[]) {
    const defaultStyle = {
        fill: false,
        lineTension: 0.25,
        pointHoverRadius: 5,
        pointRadius: 3,
        spanGaps: true
    };

    return {
        datasets: [
            {
                ...defaultStyle,
                label: 'Sell Price',
                borderColor: 'rgba(240, 150, 113,1)',
                data: history?.filter(entry => entry.buyingPrice > 0).map(entry => ({ t: new Date(entry.ts), y: entry.buyingPrice })) ?? []
            },
            {
                ...defaultStyle,
                label: 'Offer Price',
                borderColor: 'rgba(113, 151, 240,1)',
                data: history?.filter(entry => entry.sellingPrice > 0).map(entry => ({ t: new Date(entry.ts), y: entry.sellingPrice })) ?? []
            }
        ]
    }
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
    const [timeSpan, setTimeSpan] = useState(90);
    const { history } = useItemPriceHistory(props.id, timeSpan);
    const dataset = buildGraphDataset(history)

    return (
        <div>
            <div className="is-pulled-right field has-addons">
                <TimeSpanButton label="Quarter" timeSpan={4320} setTimeSpan={setTimeSpan} currentTimeSpan={timeSpan}/>
                <TimeSpanButton label="Month" timeSpan={1440} setTimeSpan={setTimeSpan} currentTimeSpan={timeSpan}/>
                <TimeSpanButton label="Week" timeSpan={180} setTimeSpan={setTimeSpan} currentTimeSpan={timeSpan}/>
                <TimeSpanButton label="Day" timeSpan={90} setTimeSpan={setTimeSpan} currentTimeSpan={timeSpan}/>
            </div>
            <Line data={dataset} options={chartOptions} />
        </div>
    );
}

export default ItemHistoryChart;