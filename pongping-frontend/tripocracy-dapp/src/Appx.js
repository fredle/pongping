import React, { useState, useEffect } from 'react';
import TripocracyABI from './TripocracyABI.json';

const contractAddress = '0x1475Ad7BFdeB76AcF645E300e44c6A5CbeBD1674';
const ethers = require("ethers")

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [description, setDescription] = useState('');
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    const init = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, TripocracyABI, signer);
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
    };
    init();
  }, []);

  const createProposal = async () => {
    try {
      const tx = await contract.createProposal(description);
      await tx.wait();
      alert('Proposal created');
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const clearProposals = async () => {
    try {
      const tx = await contract.clearProposals();
      await tx.wait();
      alert('Proposals cleared');
    } catch (error) {
      console.error('Error clearing proposals:', error);
    }
  };

  const fetchProposals = async () => {
    try {
      const proposals = await contract.getAllProposals();
      console.log(proposals);
      setProposals(proposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  return (
    <div>
      <h1>Tripocracy DApp</h1>
      <div>
        <h2>Create Proposal</h2>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Proposal Description"
        />
        <button onClick={createProposal}>Create Proposal</button>
      </div>
      <div>
        <h2>Clear Proposals</h2>
        <button onClick={clearProposals}>Clear Proposals</button>
      </div>
      <div>
        <h2>Proposals</h2>
        <button onClick={fetchProposals}>Fetch Proposals</button>
        <ul>
          {proposals.map((proposal, index) => (
            <li key={index}>
              {proposal.description} - {proposal.voteCount} votes
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;