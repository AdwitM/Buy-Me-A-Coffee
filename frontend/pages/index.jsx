import abi from '../utils/BuyMeACoffee.json';
import {
  ethers
} from "ethers";
import Head from 'next/head'
import Image from 'next/image'
import React, {
  useEffect,
  useState
} from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x42D48821026aE65f5BA2590a7EB58209618AD348";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const {
        ethereum
      } = window;

      const accounts = await ethereum.request({
        method: 'eth_accounts'
      })
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const {
        ethereum
      } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async () => {
    try {
      const {
        ethereum
      } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "Your Name",
          message ? message : "Enjoy your coffee!", {
            value: ethers.utils.parseEther("0.001")
          }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const {
        ethereum
      } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const {
      ethereum
    } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy Nero a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.png" />
        {/* <style>@import url('https://fonts.googleapis.com/css?family=Oswald&display=swap');
</style> */}
      </Head>

      <header style={{ width: '100%', padding: '15px' }}>
        <h1 className={styles.title}>
          Buy Me a Coffee! ☕
        </h1>
      </header>

      <main className={styles.main}>


        {currentAccount ? (
          <div>
            <form>
              <div className="formgroup">
                <label style={{ color: 'white' }}>
                  Name
                </label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div className="formgroup">
                <label style={{ color: 'white' }}>
                  Send me a message
                </label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  className={styles.sendMeAMessage}
                  onChange={onMessageChange}
                  required
                >
                </textarea>
              </div>
              <div>
                <button
                  className={styles.sendcoffeebutton}
                  type="button"
                  onClick={buyCoffee}
                >
                  Send 1 Coffee for 0.001ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
            <button className={styles.connectwalletbutton} onClick={connectWallet}> Connect Your Wallet </button>
          )}

        <div style={{ color: 'white' }}>
          {currentAccount && (<h1 >Tips Received</h1>)}
          <div style={{ display: 'flex' }}>
            {currentAccount && (memos.map((memo, idx) => {
              return (
                <div key={idx} style={{ border: "2px solid", "border-radius": "5px", padding: "5px", margin: "5px" }}>
                  <p style={{ "font-weight": "bold" }}>&quot;{memo.message}&quot;</p>
                  <p>From: {memo.name} at {memo.timestamp.toString()}</p>
                </div>
              )
            }))}
          </div>
        </div>
      </main>



      <footer className={styles.footer}>

        <a
          href="https://github.com/AdwitM/Buy-Me-A-Coffee"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="https://www.pngkey.com/png/full/178-1787366_coming-soon-github-white-icon-png.png" alt="GitHub Logo" style={{ width: '50px', height: '50px', padding: '5px' }}></img>
        </a>
      </footer>
    </div>
  )
}