import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== 'undefined') {
      //check if MetaMask exists
      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId();
      const accounts = await web3.eth.getAccounts();

      //check if account is detected, then load balance&setStates, elsepush alert
      if (typeof accounts[0] !== 'undefined') {
        const balance = await web3.eth.getBalance(accounts[0]);
        //assign to values to variables: web3, netId, accounts
        this.setState({ balance, account: accounts[0], web3 });

        //in try block load contracts
        try {
          const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address);
          const dBankAddress = dBank.networks[netId].address;
          const dbank = new web3.eth.Contract(dBank.abi, dBankAddress);
          this.setState({ token, dbank, dBankAddress });
        } catch (error) {
          console.error(error);
          window.alert('Failed to load token and bank');
        }
      } else {
        //if MetaMask not exists push alert
        window.alert('Please login with MetaMask');
      }


    } else {
      window.alert('Please install MetaMask extension to continue');
    }
  }

  async refreshBalance() {
    let balance = await this.state.web3.eth.getBalance(this.state.account);
    this.setState({ balance });
  }

  async deposit(amount) {
    //check if this.state.dbank is ok
    if (typeof this.state.dbank === 'undefined') {
      window.alert('There is no instance of bank');
      return;
    }
    //in try block call dBank deposit();
    try {
      await this.state.dbank.methods.deposit().send({
        value: amount.toString(),
        from: this.state.account
      });
      this.depositAmount.value = '';
      this.refreshBalance();
    } catch (error) {
      window.alert(error);
    }
  }

  async withdraw(e) {
    //prevent button from default click
    e.preventDefault();
    //check if this.state.dbank is ok
    if (typeof this.state.dbank === 'undefined') {
      window.alert('There is no instance of bank');
      return;
    }
    try {
      await this.state.dbank.methods.withdraw().send({ from: this.state.account });
      this.refreshBalance();
    } catch (error) {
      window.alert(error);
    }
    //in try block call dBank withdraw();
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={dbank} className="App-logo" alt="logo" height="32" />
            <b>dBank</b>
          </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>Welcome to dBank</h1>
          <h3>{`Your address: ${this.state.account}`}</h3>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="profile" style={{ width: 650 }} id="uncontrolled-tab-example">
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                      <br />
                      How much do you want to deposit?
                      <br />
                      (min. amount is 0.01 ETH)
                      <br />
                      (1 deposit is possible at the time)
                      <br />
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        let amount = this.depositAmount.value;
                        amount = Web3.utils.toWei(amount);
                        this.deposit(amount);
                      }}>
                        <div className='form-group mr-sm-2'>
                          <br />
                          <input id='depositAmount' step='0.01' type='number' className='form-control form-control-md'
                            placeholder='Amount' required
                            ref={(input) => { this.depositAmount = input }} />
                        </div>
                        <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <div>
                      <br />
                      Do you want to withdraw & take intrest?
                      <br />
                      <br />
                      <div>
                        <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                      </div>
                    </div>
                  </Tab>
                  <Tab eventKey="balance" title="Balance">
                    <div>
                      <br />
                      Your current balance is
                      <br />
                      <br />
                      <div>
                        {`${Web3.utils.fromWei(`${this.state.balance}`)} ETH`}
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;