# React Dapp

This is a sample Dapp to read yv token balances in your wallet built using React. 
It uses ethers.js as a web3 library to connect to your wallet and displays your token balances. 

In the future, I would like to continue to add functionality to the dApp, but for now, it is simple. 

## Running the Dapp

This project uses [`create-react-app`](https://create-react-app.dev/), so most
configuration files are handled by it.

To run it, you just need to execute `npm start` in a terminal, and open
[http://localhost:3000](http://localhost:3000).

To learn more about what `create-react-app` offers, you can read
[its documentation](https://create-react-app.dev/docs/getting-started).

## Architecture of the Dapp

This Dapp consists of multiple React Components, which you can find in
`src/components`.

Most of them are presentational components, have no logic, and just render HTML.

The core functionality is implemented in `src/components/TokenReader.js`.

