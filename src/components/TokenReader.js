import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";
import { getAddressBalances } from 'eth-balance-checker/lib/ethers';

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";

import { yvDaiBytecode } from "../contracts/yvDAI";


// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '31337';

const supportedVaults = {
  'yvDAI' : '0xdA816459F1AB5631232FE5e97a05BBBb94970c95', // 18 Deccimals
  'yvUSDC' : '0x5f18c75abdae578b483e5f43f12a39cf75b973a9', // 6 Decimals 
  'yvUSDT' : '0x7Da96a3891Add058AdA2E826306D812C638D87a7', // 6 Decimals 
}




// This is an error code that indicates that the user canceled a transaction
// const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and eth-balance-checker
//   3. Polls the user's balances of various tokens to to keep it updated.
//   4. Renders the whole application

export class TokenReader extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The user's address and balance
      selectedAddress: undefined,
      tokenBalances: undefined,
      balancesLoading: true
    };

    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (this.state.balancesLoading) {
      return (
        <div className="container p-4">
          <div className="row">
            <div className="col-12">
              <h1>
                Welcome, <b>{this.state.selectedAddress}</b>
              </h1>
            </div>
          </div>
  
          <hr />
          <p>
            Your yvDAI balance is: loading...
          </p>
          <p>
            Your yvUSDC balance is: loading...
          </p>
          <p>
            Your yvUSDT balance is: loading...
          </p>
        </div>
      );
    }

    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              Welcome, <b>{this.state.selectedAddress}</b>
            </h1>
          </div>
        </div>

        <hr />
        <p>
          Your yvDAI balance is: { this.state.tokenBalances[supportedVaults['yvDAI']]}
        </p>
        <p>
          Your yvUSDC balance is: { this.state.tokenBalances[supportedVaults['yvUSDC']]}
        </p>
        <p>
          Your yvUSDT balance is: { this.state.tokenBalances[supportedVaults['yvUSDT']]}
        </p>
      </div>
    );
  }

  pollTokenBalances() {
    const vaultAddresses = [
      supportedVaults['yvDAI'], //yvDAI
      supportedVaults['yvUSDC'], //yvUSDC
      supportedVaults['yvUSDT'], //yvUSDT
    ];

    // This object stores how many decimials the yv Token has. 
    // Why don't they all use the same amount of decimals? Don't ask me!
    const tokenDecimals = {
      '0xdA816459F1AB5631232FE5e97a05BBBb94970c95' : 18, //yvDAI
      '0x5f18c75abdae578b483e5f43f12a39cf75b973a9' : 6, //yvUSDC
      '0x7Da96a3891Add058AdA2E826306D812C638D87a7' : 6, //yvUSDT
    }
    
    // getAddressBalances() is from eth-balance-checker 
    // it takes the current wallet address and returns the balances of all tokens in the tokens arrary
    // balances are returned as a promise, once resolved we'll put them in the tokensAndBalances object

    getAddressBalances(this._provider, this.state.selectedAddress.toString(), vaultAddresses) .then(balances => {
      let tokenAddresses = [];
      let tokensAndBalances = {};

      for (const property in vaultAddresses) {
        tokenAddresses.push(`${vaultAddresses[property]}`);
      }

      // console.log(tokenAddresses);

      for(let i = 0; i < tokenAddresses.length; i++) {
        let currentAddress = tokenAddresses[i];
        let tokenBalance = balances[currentAddress];
        tokensAndBalances[currentAddress] = _insertDecimal(tokenBalance, tokenDecimals[currentAddress]);
      }

      // console.log(tokensAndBalances)

      // For the purposes of demonstration, this shows yvDAI balance
      this.setState({
        tokenBalances: tokensAndBalances,
        balancesLoading: false,
      });
    })

    //helper function to add decimial to balances
    function _insertDecimal(rawBalance, numberOfDecimials) {
      if (numberOfDecimials === 18) {
        return Number((rawBalance / 1000000000000000000).toFixed(18));
      }
      if (numberOfDecimials === 6) {
        return Number((rawBalance / 1000000).toFixed(6));
      }
    }
  }

  /*
    This function would call the pricePerShare() in the yvDAI contract and return the DAI price of each yvDAI token.
    Later, this could be used to convert yv token balances to their native token values. 
    For now, this fn is commented out becuase metamask is being used as the provider and such, calling this fn costs gas.

    async yvDAIPricePerShare() {

      const signer = this._provider.getSigner();

      const yvDAIContract = new ethers.Contract(supportedVaults['yvDAI'], yvDaiBytecode, signer)

      let pricePerShare = await yvDAIContract.pricePerShare();
      
      console.log(pricePerShare);

    }
  */
  
  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.enable();

    // Once we have the address, we can initialize the application.
    this._initialize(selectedAddress);

    this.pollTokenBalances();
    // commented out because the fn is too. See comment at line 184.
    // this.yvDAIPricePerShare();
    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._resetState();
      // this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
      this.pollTokenBalances();
    });
    
    // We reset the dapp state if the network is changed
    window.ethereum.on("networkChanged", ([networkId]) => {
      // this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._intializeEthers();
  }

  async _intializeEthers() {
    // We initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

 // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }
}