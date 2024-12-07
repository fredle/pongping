// Import everything
import { ethers } from "ethers";

// Import just a few select items
import { BrowserProvider, parseUnits } from "ethers";

// Import from a specific export
import { HDNodeWallet } from "ethers/wallet";
import React, { useState, useEffect } from 'react';
import CoinTossABI from './CoinTossABI.json';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';



const contractAddress = '0x50bC93420B345836EC9abac7AA76A2d01F43E7bd'; //base
//const contractAddress = '0xf029Bc092a0EC2F550c8C72c5A2D81fF39c3d265'; //sepolia
//const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; //local


function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}


function App() {
  

    const [signerAddress, setSignerAddress] = useState("No Account Connected");
    const [contractBalance, setContractBalance] = useState(null);
    const [playerBalance, setPlayerBalance] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [deposit, setDeposit] = useState(0);
    const [message, setMessage] = useState("");
    const [value, setValue] = useState(0);


    
    const [open, setOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");

    const handleClose = () => {
      setOpen(false);
    };

    const handleLoss = () => {
      setDialogMessage("You lost the coin toss. Better luck next time!");
      setOpen(true);
      getPlayerBalance();
    };

    const handleWin = (winnings) => {
      setDialogMessage(`You won ${ethers.formatUnits(winnings, 'ether')} ETH! Congratulations!`);
      setOpen(true);
      getPlayerBalance();
    };


    const handleChange = (event, newValue) => {
      setValue(newValue);
    };
    useEffect(() => {
        const initializeProvider = async () => {
            let signer = null;

            let provider;
            if (window.ethereum == null) {
            
                console.log("MetaMask not installed; using read-only defaults")
                provider = ethers.getDefaultProvider()
            
            } else {
                provider = new ethers.BrowserProvider(window.ethereum)

                try {
                  signer = await provider.getSigner();
                  
                  setSignerAddress(await signer.getAddress())
                  console.log(signerAddress);
                  const contract = new ethers.Contract(contractAddress, CoinTossABI, signer);
                  setSigner(signer);
                  setContract(contract);

                  contract.on('CoinTossResult', (player, result, winnings) => {
                    console.log(`Coin toss result: ${result}`);
                    console.log(`Winnings: ${ethers.formatUnits(winnings, 'ether')} ETH`);
                    //getPlayerBalance();
                    if (result === 'Tails') {
                      handleLoss();
                    } else {
                      handleWin(winnings);
                    }
                  });
                  contract.on('Deposit', (user, amount) => {
                    console.log(`Deposit event: ${user} deposited ${ethers.formatUnits(amount, 'ether')} ETH`);
                    const depositMessage = `Deposit event: ${user} deposited ${ethers.formatUnits(amount, 'ether')} ETH`;
                    setMessage(depositMessage);
                  });
                } catch (error) {
                  console.log(error.code);
                  if (error.code === -32002) {
                    console.error('User is not logged in to MetaMask');
                  } else {
                    console.error('Error connecting to MetaMask:', error);
                  }
                }
            }

        };

        initializeProvider();
    }, []);


    const getContractBalance = async () => {
      try {
        const balance = await contract.getContractBalance();
        console.log(balance);
        const balanceInEth = ethers.formatUnits(balance, 'ether');
        console.log('Contract balance in ETH:', balanceInEth);
        setContractBalance(balanceInEth);
      } catch (error) {
        const errorMessage = error.reason || error.message.split(':').pop().trim();
        console.error('Error fetching contract balance:', error);
        setDialogMessage(`Error fetching contract balance: ${errorMessage}`);
        setOpen(true);
      }
    };
    
    const depositFunds = async (amount) => {
      setMessage("Depositing");
      try {
        console.log(contract)
        console.log({
            value: ethers.parseUnits(amount, 'ether'),
            contractAddress: contract.address,
        });        
        const tx = await contract.depositFunds({ value: ethers.parseUnits(amount, 'ether') });
        await tx.wait();
        console.log('Deposit successful:', tx);
        setDialogMessage("Deposit successful");
        setOpen(true);

      } catch (error) {
        const errorMessage = error.reason || error.message.split(':').pop().trim();
        setDialogMessage(`Deposit Failed: ${errorMessage}`);
        console.error('Deposit Failed:', error);
        setOpen(true);

      }
    };

    const withdrawFunds = async (amount) => {
      try {
        const tx = await contract.withdraw(ethers.parseUnits(amount, 'ether'));
        await tx.wait();
        console.log('Withdrawal successful:', tx);
        setDialogMessage(`Withdrawal successful`);
        setOpen(true);

      } catch (error) {
        const errorMessage = error.reason || error.message.split(':').pop().trim();
        console.error('Error making withdrawal:', error);
        setDialogMessage(`Error making withdrawal: ${errorMessage}`);
        setOpen(true);

      }
    };

    const tossCoin = async (betAmount) => {
      setDialogMessage("Flipping the coin! please accept the Wallet Transaction");
      setOpen(true);
      try {
        const tx = await contract.coinToss(ethers.parseUnits(betAmount, 'ether'));
        await tx.wait();
        console.log('Coin toss transaction successful:', tx);
        setOpen(false);
        setDialogMessage("Flipping the coin!, please wait for the result");
        setOpen(true);

      } catch (error) {
        const errorMessage = error.reason || error.message.split(':').pop().trim();
        setDialogMessage(`Error: ${errorMessage}`);
        console.error('Error tossing coin:', error);
        setOpen(true);

      }
    };

    const playerWithdrawFunds = async (amount) => {
      try {
        const tx = await contract.playerWithdraw(ethers.parseUnits(amount, 'ether'));
        await tx.wait();
        console.log('Player withdrawal successful:', tx);
        setDialogMessage("Player withdrawal successful");
        setOpen(true);
      } catch (error) {
        const errorMessage = error.reason || error.message.split(':').pop().trim();
        console.error('Error making player withdrawal:', error);
        setDialogMessage(`Error making player withdrawal: ${errorMessage}`);
        setOpen(true);
      }
    };

    const playerWithdrawAllFunds = async () => {
      try {
        const tx = await contract.playerWithdrawAll();
        await tx.wait();
        console.log('Player withdrawal of all funds successful:', tx);
        setDialogMessage("Player withdrawal of all funds successful");
        setOpen(true);

      } catch (error) {
        const errorMessage = error.reason || error.message.split(':').pop().trim();
        console.error('Error making player withdrawal of all funds:', error);
        setDialogMessage(`Error making player withdrawal of all funds: ${errorMessage}`);
        setOpen(true);
      };
    };
    const getPlayerBalance = async () => {
      try {
        const balance = await contract.getPlayerBalance();
        const balanceInEth = ethers.formatUnits(balance, 'ether');

        setPlayerBalance(balanceInEth);
        console.log('Player balance:', balanceInEth);
      } catch (error) {
        const errorMessage = error.reason || error.message.split(':').pop().trim();
        console.error('Error fetching player balance:', error);
        setDialogMessage(`Error fetching player balance: ${errorMessage}`);
        setOpen(true);

      }
    };

    return (
      <div style={{ height: '100vh', overflow: 'hidden' }}>
      <h1>CoinToss DApp</h1>

      <div>Account: {signerAddress}</div>


      <div>
        <div>Player Balance: {playerBalance}ETH<button onClick={getPlayerBalance}>🔄</button></div>
        <div>Contract Balance: {contractBalance}ETH<button onClick={getContractBalance}>🔄</button></div>
      </div>
      <Tabs value={value} onChange={handleChange} aria-label="coin toss tabs">
        <Tab label="Play" />
        <Tab label="Account Management" />
      </Tabs>
    
      {/* Play Tab */}
      <TabPanel value={value} index={0}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <div>
          <h2>Coin Toss</h2>
          <div>Heads to win!</div>
          <input
            type="text"
            placeholder="Bet Amount in ETH"
            onChange={(e) => setDeposit(e.target.value)}
          />
          <button onClick={() => tossCoin(deposit)}>Toss Coin</button>
          </div>
        </Box>
        </TabPanel>
    
      {/* Account Management Tab */}
      <TabPanel value={value} index={1}>
        <Box display="flex" flexDirection="column" alignItems="center" height="100%">
        <div>{message}</div>

        <div>
          <h2>Deposit Funds</h2>
          <input
          type="text"
          placeholder="Amount in ETH"
          onChange={(e) => setDeposit(e.target.value)}
          />
          <button onClick={() => depositFunds(deposit)}>Deposit</button>
        </div>
        <div>
          <h2>Player Withdraw Funds</h2>
          <input
          type="text"
          placeholder="Amount in ETH"
          onChange={(e) => setDeposit(e.target.value)}
          />
          <button onClick={() => playerWithdrawFunds(deposit)}>Player Withdraw</button>
        </div>
        <div>
          <h2>Player Withdraw All Funds</h2>
          <button onClick={playerWithdrawAllFunds}>Player Withdraw All</button>
        </div>
        <div>
          <h2>Owner Withdraw Funds</h2>
          <input
          type="text"
          placeholder="Amount in ETH"
          onChange={(e) => setDeposit(e.target.value)}
          />
          <button onClick={() => withdrawFunds(deposit)}>Withdraw</button>
        </div>

        </Box>
      </TabPanel>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Result</DialogTitle>
        <DialogContent>
          <p>{dialogMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      </div>
    );
  }
    

export default App;