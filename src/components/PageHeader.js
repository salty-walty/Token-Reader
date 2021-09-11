import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/styles/Header.css"


export class PageHeader extends React.Component {
  render() {

    return (
      <header>
        <div className="site-head">
          <h2>Yearn Vault Token Reader</h2>
          <p>Check your yv token balances, not their converted values.</p>
        </div>
      </header>
    )
  }
}