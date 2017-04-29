import React from "react";
import {render} from "react-dom";
import Home from "./home.jsx";


import Navbar from './navbar.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: "home" 
        }

    }

    handleTabClick(newTab) {
        this.setState({activeTab: newTab})
    }

    render() {

        let content;
        switch (this.state.activeTab) {
            case "home":
                content = <Home />
                break;
            case "search":
                content = <div className="page-content">Search page</div>
                break;
            case "account":
                content = <div className="page-content">Account page</div>
                break;
        }

        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">
                <Navbar activeTab={this.state.activeTab} handleTabClick={this.handleTabClick.bind(this)}/>                
                <main className="mdl-layout__content">
                    {content}
                </main>
            </div>
        )

    }
}