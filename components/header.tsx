import React, { useState } from 'react';
import Link from 'next/link';
import classNames from 'classnames';

export default (props) => {
    const [isBurgerActive, setBurgerActive] = useState(false);

    return (
        <div className="navbar is-fixed-top" role="navigation">
            <div className="navbar-brand">
                <div className="navbar-item">
                    <span className="home-icon icon">
                        <i className="fas fa-coins fa-3x"/>
                    </span>
                    <h1 className="title">
                        GoldMind
                    </h1>
                </div>
                <a role="button" className={classNames("navbar-burger", {
                    'is-active': isBurgerActive
                })} aria-label="menu" aria-expanded="false" data-target="navbarBasicExample"
                onClick={() => setBurgerActive(!isBurgerActive)}>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>
            <div className={classNames("navbar-menu", {
                'is-active': isBurgerActive
            })}>
                <div className="navbar-start">
                    <Link href="/favoriteItems"><a className="navbar-item">Favorites</a></Link>
                    <Link href="/suggestedItems"><a className="navbar-item">Suggested Items</a></Link>
                    <div className="navbar-item has-dropdown is-hoverable">
                        <a className="navbar-link">Others</a>
                        <div className="navbar-dropdown">
                            <Link href="/highVolume"><a className="navbar-item">High Volume</a></Link>
                            <Link href="/highestMargin"><a className="navbar-item">High Margin</a></Link>
                        </div>
                    </div>
                </div>
                <div className="navbar-end">
                    <div className="navbar-item">
                        <div className="field has-addons">
                            <div className="control has-icons-left">
                                <input className="input" type="text" placeholder="Search for items..." />
                                <span className="icon is-small is-left">
                                    <i className="fas fa-search" />
                                </span>
                            </div>
                            <div className="control">
                                <a className="button is-info">
                                    Search
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};