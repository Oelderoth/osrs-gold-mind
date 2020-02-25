import './style.scss';

import React, { ReactElement, useState, RefObject, useImperativeHandle } from 'react';

import classNames from 'classnames';
import escapeStringRegexp from 'escape-string-regexp';

interface TypeaheadProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    suggestions: string[];
    maxSuggestions?: number;
    onSuggestionSelect?: (suggestion: string, setValue?:(value: String) => void) => void;
}

export interface TypeaheadInputElement {
    value: string;
    setValue: (val: string) => void;
}

const typeaheadOnFocus = (setFocused: (isFocused: boolean) => void,
    onFocus: (event: React.FocusEvent<HTMLInputElement>) => void,
    event: React.FocusEvent<HTMLInputElement>) => {

    setFocused(true);
    onFocus?.(event);
}

const typeaheadOnBlur = (setFocused: (isFocused: boolean) => void,
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void,
    event: React.FocusEvent<HTMLInputElement>) => {

    setFocused(false);
    onBlur?.(event);
}

const typeaheadOnChange = (setValue: (value: string) => void,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    event: React.ChangeEvent<HTMLInputElement>) => {

    setValue(event.target.value);
    onChange?.(event);
}

const typeaheadOnSuggestionSelect = (onSuggestionSelect: (suggestion: string, setValue?:(value: string) => void) => void, suggestion: string, setValue: (value: string) => void) => {
    onSuggestionSelect?.(suggestion, setValue)
}

const suggestionBoldMatch = (value: string, onSuggestionSelect: (suggestion: string) => void, setValue: (value: string) => void): (suggestion: string, index: number) => ReactElement => {
    const escaped = '^(.*?)' + escapeStringRegexp(value).split(/\s+/g).map(segment => `(${segment})`).join('(.+?)') + '(.*?)$'
    const regex = new RegExp(escaped, 'i')

    return (suggestion: string, index: number) => {
        const matches = regex.exec(suggestion);
        return (<div key={`${suggestion}-${index}`} className="typeahead-entry" onMouseDown={(event) => {
            typeaheadOnSuggestionSelect(onSuggestionSelect, suggestion, setValue);
        }}>{matches.slice(1).map((match, index) => index % 2 == 0 ? match : <span className='has-text-weight-semibold'>{match}</span>)}</div>);
    };
}

const suggestionFilter = (value: string): (suggestion: string) => boolean => {
    if (!value || value.length == 0) return () => false;

    const escaped = escapeStringRegexp(value).replace(/\s+/g, '.+?');
    const regex = new RegExp(escaped, 'i')

    return (suggestion) => regex.test(suggestion);
}

const TypeaheadInput = (props: TypeaheadProps, ref: RefObject<TypeaheadInputElement>): ReactElement => {
    const [isFocused, setFocused] = useState(false);
    const [value, setValue] = useState('');
    const { suggestions, onFocus, onBlur, onChange, onSuggestionSelect, maxSuggestions = 5, ...others } = props;

    const filteredSuggestions = suggestions.filter(suggestionFilter(value)).sort((a, b) => a.localeCompare(b)).slice(0, maxSuggestions);

    useImperativeHandle(ref, () => ({
        set value(val: string) {
            setValue(val);
        },
        get value(): string {
            return value
        },
        setValue: (value: string) => {
            setValue(value);
        }
    }));

    return (<span className='typeahead'>
        <input {...others}
            onFocus={(event) => typeaheadOnFocus(setFocused, onFocus, event)}
            onBlur={(event) => typeaheadOnBlur(setFocused, onFocus, event)}
            onChange={(event) => typeaheadOnChange(setValue, onChange, event)}
            value={value} />
        <span className={classNames('typeahead-menu', { 'is-visible': value?.length > 0 && isFocused })}>
            {filteredSuggestions.map(suggestionBoldMatch(value, onSuggestionSelect, setValue))}
        </span>
    </span>);
}

export default React.forwardRef(TypeaheadInput);