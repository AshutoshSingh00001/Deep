import { WsProvider, ApiPromise } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import {ChangeEvent, useEffect, useState} from 'react'
import {InjectedAccountWithMeta} from '@polkadot/extension-inject/types'
import {stringToHex} from '@polkadot/util'

const NAME = 'GmorDie';
const u32 = "28";
var u33 = 1;

const mint_to = null;
const witnessData = {
  ownedItem: 0, mintPrice: 1
};


///metadata///
const cloudflare_url = "https://cloudflare-ipfs.com/ipfs/bafybeihks3nbiufzecokqjkzjqq2ehcjfwy2tikexei36kazovqjagew3q/";
const json = ".json";
const metadata = cloudflare_url + u33 + json;
const Bytes = stringToHex(metadata);


const App = () => {
  const [api, setApi] = useState<ApiPromise>();
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setselectedAccounts] = useState<InjectedAccountWithMeta>();

  const setup = async() => {
    const wsProvider = new WsProvider("wss://westmint-rpc.polkadot.io");
    const api = await ApiPromise.create({ provider: wsProvider})
    setApi(api);
  }
  const handleConnection = async () => {
    const extension = await web3Enable(NAME);

    if (!extension) {
      throw Error ("NO_Extension Found");

    }
    const allAccounts = await web3Accounts();
    setAccounts(allAccounts);

    if(allAccounts.length == 1) {
      setselectedAccounts(allAccounts[0]);
    }
  };

  const handleAccountSelection = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedAddress = e.target.value
    const account = accounts.find(
    account => account.address == selectedAddress)

    if (!account){
      throw Error ("NO_Account_Found");

    }
    setselectedAccounts(account)
    
  }
const handleMint = async () => {
  if(!api) return

  if(!selectedAccount) return
  const injector = await web3FromAddress(selectedAccount.address)
  
  const mint = api.tx.utility.batchAll([await api.tx.nfts.mint(u32, u33, mint_to,  witnessData ),
    await api.tx.nfts.setMetadata(u32, u33, Bytes )]).signAndSend(selectedAccount.address, {
    signer: injector.signer
  }, ({ status }: { status: any }) => {
    if (status.isInBlock) {
        console.log(`Completed at block hash #${status.asInBlock.toString()}`);
        u33++
    }
    else {
        console.log(`Current status: ${status.type}`);
    }
}).catch((error: any) => {
    console.log(':( transaction failed', error);
});
}

  useEffect(()=>{
    setup();}, []);
useEffect(()=> {
  if (!api) return;
  (async () => {
    const time = await api.query.timestamp.now();
    console.log(time.toPrimitive());

  })();
}, [api])
return (
  <div>
    {accounts.length == 0 ? (
    <button onClick={handleConnection}>
connect
    </button>
    ) : null}
    
    {accounts.length > 0 && !selectedAccount? (
      <>
      <select onChange={handleAccountSelection}>
      <option value="" disabled  hidden>
        choose your account
      </option>
      {accounts.map((account) => (
        <option value={account.address}>{account.meta.name || account.address}</option>
      ))}
      </select>
      </>
    ): null}
    
    {selectedAccount ? selectedAccount.address : null}
    <button onClick={handleMint}>Burn 10 Fren</button>
    
  </div>
)}

export default App
