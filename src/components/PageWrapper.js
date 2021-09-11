import React from "react";
import { TokenReader } from "./TokenReader";
import { PageHeader } from "./PageHeader";
import "bootstrap/dist/css/bootstrap.css";
import "../assets/styles/Global.css"



export class PageWrapper extends React.Component {
  render() {

    return (
      <main>
        <PageHeader />
        <TokenReader />
      </main>
    )
  }
}