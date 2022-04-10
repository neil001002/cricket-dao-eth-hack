import "./styles/App.css";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CricketDaoNFT_ABI from "./utils/CricketDaoNFT_ABI.json";
import twitterLogo from "./assets/twitter-logo.svg";
import polygonLogo from "./assets/polygonlogo.png";
import ethLogo from "./assets/ethlogo.png";
import { networks } from "./utils/networks";
import DaoPage from "./components/DaoPage";

// Constants
const TWITTER_HANDLE = "neil001002";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CRICKET_DAO_NFT_CONTRACT = "0xd146791DD95444385b0cff5E7552d1f8eaDFf960";

function App() {
  const [network, setNetwork] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [nftId, setNsftId] = useState();

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }

    const chainId = await ethereum.request({ method: "eth_chainId" });
    setNetwork(networks[chainId]);

    ethereum.on("chainChanged", handleChainChanged);

    // Reload the page when they change networks
    function handleChainChanged(_chainId) {
      window.location.reload();
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Mumbai testnet
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13881" }], // Check networks.js for hexadecimal network ids
        });
      } catch (error) {
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it to their MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x13881",
                  chainName: "Polygon Mumbai Testnet",
                  rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
                  nativeCurrency: {
                    name: "Mumbai Matic",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      // If window.ethereum is not found then MetaMask is not installed
      alert("MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html");
    }
  };

  const balanceOf = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CRICKET_DAO_NFT_CONTRACT, CricketDaoNFT_ABI.abi, signer);

        const balanceOf = await contract.balanceOf(currentAccount);
        console.log("%s balance is %s ", currentAccount, balanceOf);
        if (balanceOf > 0) {
          setIsMember(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (currentAccount) {
    balanceOf();
  }

  const mint = async (id) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CRICKET_DAO_NFT_CONTRACT, CricketDaoNFT_ABI.abi, signer);

        let txn = await contract.claim(id);
        await txn.wait();
        console.log(`Minted NFT with ID ${id}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderDaoPage = () => {
    if (network !== "Polygon Mumbai Testnet") {
      return (
        <div className="connect-wallet-container">
          <h2>Please switch to Polygon Mumbai Testnet</h2>
          {/* This button will call our switch network function */}
          <button className="cta-button mint-button" onClick={switchNetwork}>
            Click here to switch
          </button>
        </div>
      );
    }
    return (
      <div>
        {isMember === false ? (
          <div>
            <h2>You don't have any Membership NFT !!!</h2>
            <input placeholder="Token ID" type="text" onChange={(e) => setNsftId(e.target.value)} />
            <button className="cta-button connect-wallet-button" onClick={() => mint(nftId)}>
              Mint
            </button>
          </div>
        ) : (
          <DaoPage />
        )}
      </div>
    );
  };

  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              <p className="title">🏏Cricket DAO</p>
              <p className="subtitle">A DAO Where We Live & Breathe Cricket!</p>
            </div>
            {/* Display a logo and wallet connection status*/}
            <div className="right">
              <img alt="Network logo" className="logo" src={network.includes("Polygon") ? polygonLogo : ethLogo} />
              {currentAccount ? (
                <p>
                  {" "}
                  Wallet: {currentAccount.slice(0, 6)}...
                  {currentAccount.slice(-4)}{" "}
                </p>
              ) : (
                <p> Not connected </p>
              )}
            </div>
          </header>
        </div>

        {/* Add your render method here */}
        {!currentAccount && renderNotConnectedContainer()}

        {/* Add your render method here */}
        {currentAccount && renderDaoPage()}

        {/* footer */}
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a className="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer">{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
}

export default App;
