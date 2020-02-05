import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import escapeStringRegexp from 'escape-string-regexp';

import './style.scss';

interface TypeaheadProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    suggestions: string[];
}

const typeaheadOnFocus = (setFocused: (isFocused: boolean) => void, 
    onFocus: (event: React.FocusEvent<HTMLInputElement>) => void, 
    event:React.FocusEvent<HTMLInputElement>) => {

    setFocused(true);
    onFocus?.(event);
}

const typeaheadOnBlur = (setFocused: (isFocused: boolean) => void, 
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void, 
    event:React.FocusEvent<HTMLInputElement>) => {

    setFocused(false);
    onBlur?.(event);
}

const typeaheadOnChange = (setValue: (value: string) => void,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void, 
    event: React.ChangeEvent<HTMLInputElement>) => {

    setValue(event.target.value);
}

const suggestionBoldMatch = (value: string): (suggestion: string) => ReactElement => {
    const escaped = '^(.*?)' + escapeStringRegexp(value).split(/\s+/g).map(segment => `(${segment})`).join('(.+?)') + '(.*?)$'
    const regex = new RegExp(escaped, 'i')
    
    return (suggestion: string) => {
        const matches = regex.exec(suggestion);
        return (<span className="typeahead-match">{matches.slice(1).map((match, index) => index%2 == 0 ? match : <span className='has-text-weight-semibold'>{match}</span>)}</span>);
    };
}

const suggestionFilter = (value: string): (suggestion: string) => boolean => {
    if (!value || value.length == 0) return () => false;

    const escaped = escapeStringRegexp(value).replace(/\s+/g, '.+?');
    const regex = new RegExp(escaped, 'i')
    
    return (suggestion) => regex.test(suggestion);
}

const suggestionSort = () => {}

const TypeaheadInput = (props: TypeaheadProps) : ReactElement => {
    const [isFocused, setFocused] = useState(false);
    const [value, setValue] = useState('');
    const {suggestions, onFocus, onBlur, onChange, ...others} = props;

    const filteredSuggestions = suggestions.filter(suggestionFilter(value));

    return (<span className='typeahead'>
        <input {...others} 
            onFocus={(event) => typeaheadOnFocus(setFocused, onFocus, event)} 
            onBlur={(event) => typeaheadOnBlur(setFocused, onFocus, event)}
            onChange={(event) => typeaheadOnChange(setValue, onChange, event)}
            value={value}/>
        <span className={classNames('typeahead-menu', {'is-visible': isFocused})}>
            {filteredSuggestions.map(suggestionBoldMatch(value))}
        </span>
    </span>);
}

export default TypeaheadInput;