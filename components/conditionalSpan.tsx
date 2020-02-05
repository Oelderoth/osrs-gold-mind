import React, { ReactElement } from 'react';
import classNames from 'classnames';

interface ConditionalSpanProps {
    value: number | string;
    threshold: number | string;
    thresholdClasses: string[];
    prefixes?: string[];
    className?: string;
}

/**
 * Accepts a value and a threshold, and then applies either the first or second thresholdClass
 * depending on if the value is less than or greater than the threshold. Can also apply prefix text if provided
 */
const ConditionalSpan = (props: ConditionalSpanProps): ReactElement => {
    const {value, threshold, thresholdClasses, className, prefixes, ...other} = props;

    const classes = {}
    classes[thresholdClasses[0]] = value >= threshold;
    classes[thresholdClasses[1]] = value < threshold;

    return (
        <span className={classNames(className, classes)} {...other}>
            {prefixes ? value >= threshold ? prefixes[0] : prefixes[1] : null}{value}
        </span>
    )
}

export default ConditionalSpan;