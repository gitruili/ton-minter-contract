// import { Address, Cell, TonClient, WalletContract, WalletV3R2Source, toNano } from "ton";
// import { mnemonicToWalletKey } from "ton-crypto";
import { initData, initMessage } from "./jetton-minter.deploy";
import axios from "axios";
import axiosThrottle from "axios-request-throttle";
axiosThrottle.use(axios, { requestsPerSecond: 0.5 }); // required since toncenter jsonRPC limits to 1 req/sec without API key

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import glob from "fast-glob";
import { Address, Cell, CellMessage, CommonMessageInfo, fromNano, InternalMessage, StateInit, toNano } from "ton";
import { TonClient, WalletContract, WalletV3R2Source, contractAddress, SendMode } from "ton";
import { mnemonicNew, mnemonicToWalletKey } from "ton-crypto";

interface DeployParams {
  name: string;
  symbol: string;
  image: string;
  description: string;
  ownerAddress: string;
  amount: number;
  // deployerMnemonic: string;
}

export class DeployService {
  private client: TonClient;
  
  constructor(isTestnet: boolean = true) {
    this.client = new TonClient({
      endpoint: `https://${isTestnet ? "testnet." : ""}toncenter.com/api/v2/jsonRPC`
    });
  }

  async deployJetton(params: DeployParams) {
    console.log("Deploying jetton with params:", params);
    try {
      // Convert mnemonic to wallet key
      // const walletKey = await mnemonicToWalletKey(params.deployerMnemonic.split(" "));
      // console.log("Wallet key:", walletKey);
      
      // Create wallet contract
      // const walletContract = WalletContract.create(
      //   this.client, 
      //   WalletV3R2Source.create({ 
      //     publicKey: walletKey.publicKey, 
      //     workchain: 0 
      //   })
      // );

      // Check wallet balance
      // const walletBalance = await this.client.getBalance(walletContract.address);
      // console.log("Wallet balance:", walletBalance);
      // if (walletBalance.lt(toNano(0.2))) {
      //   throw new Error("Insufficient wallet balance. Minimum 0.2 TON required.");
      // }

      // Override jettonParams in deploy script
      process.env.JETTON_NAME = params.name;
      process.env.JETTON_SYMBOL = params.symbol;
      process.env.JETTON_IMAGE = params.image;
      process.env.JETTON_DESCRIPTION = params.description;
      process.env.OWNER_ADDRESS = params.ownerAddress;
      process.env.AMOUNT = params.amount.toString();

      // Get init data and message
      // const initDataCell = initData();
      // console.log("Init data cell:", initDataCell);
      // const initMessageCell = initMessage();
      // console.log("Init message cell:", initMessageCell);

      // Deploy logic similar to _deploy.ts
      // Reference the deployment logic from build/_deploy.ts lines 106-140
      
      const deployResult = await this.executeDeployment(
        // walletContract,
        // walletKey.secretKey,
        // initDataCell,
        // initMessageCell
      );
      console.log("Deploy result:", deployResult);
      return deployResult;

    } catch (error) {
      console.error("Deployment failed:", error);
      throw error;
    }
  }

  private async executeDeployment() {
    // Implementation referencing build/_deploy.ts
    // Lines 106-140 contain the core deployment logic
    console.log(`=================================================================`);
    console.log(`Deploy script running, let's find some contracts to deploy..`);
  
    const isTestnet = process.env.TESTNET || process.env.npm_lifecycle_event == "deploy:testnet";
  
    // check input arguments (given through environment variables)
    if (isTestnet) {
      console.log(`\n* We are working with 'testnet' (https://t.me/testgiver_ton_bot will give you test TON)`);
    } else {
      console.log(`\n* We are working with 'mainnet'`);
    }
  
    // initialize globals
    const client = new TonClient({ endpoint: `https://${isTestnet ? "testnet." : ""}toncenter.com/api/v2/jsonRPC` });
    const deployerWalletType = "org.ton.wallets.v3.r2"; // also see WalletV3R2Source class used below
    // const newContractFunding = toNano(0.5); // this will be (almost in full) the balance of a new 
    const newContractFunding = toNano(0.05); // this will be (almost in full) the balance of a new deployed contract and allow it to pay rent
    const workchain = 0; // normally 0, only special contracts should be deployed to masterchain (-1)
  
    // make sure we have a wallet mnemonic to deploy from (or create one if not found)
    const deployConfigEnv = ".env";
    let deployerMnemonic;
    if (!fs.existsSync(deployConfigEnv) || !process.env.DEPLOYER_MNEMONIC) {
      console.log(`\n* Config file '${deployConfigEnv}' not found, creating a new wallet for deploy..`);
      deployerMnemonic = (await mnemonicNew(24)).join(" ");
      const deployWalletEnvContent = `DEPLOYER_WALLET=${deployerWalletType}\nDEPLOYER_MNEMONIC="${deployerMnemonic}"\n`;
      fs.writeFileSync(deployConfigEnv, deployWalletEnvContent);
      console.log(` - Created new wallet in '${deployConfigEnv}' - keep this file secret!`);
    } else {
      console.log(`\n* Config file '${deployConfigEnv}' found and will be used for deployment!`);
      deployerMnemonic = process.env.DEPLOYER_MNEMONIC;
    }
  
    // open the wallet and make sure it has enough TON
    const walletKey = await mnemonicToWalletKey(deployerMnemonic.split(" "));
    const walletContract = WalletContract.create(client, WalletV3R2Source.create({ publicKey: walletKey.publicKey, workchain }));
    console.log(` - Wallet address used to deploy from is: ${walletContract.address.toFriendly()}`);
    const walletBalance = await client.getBalance(walletContract.address);
    if (walletBalance.lt(toNano(0.2))) {
      console.log(` - ERROR: Wallet has less than 0.2 TON for gas (${fromNano(walletBalance)} TON), please send some TON for gas first`);
      process.exit(1);
    } else {
      console.log(` - Wallet balance is ${fromNano(walletBalance)} TON, which will be used for gas`);
    }
  
    // go over all the contracts we have deploy scripts for
    const rootContracts = glob.sync(["build/*.deploy.ts"]);
    for (const rootContract of rootContracts) {
      // deploy a new root contract
      console.log(`\n* Found root contract '${rootContract} - let's deploy it':`);
      const contractName = path.parse(path.parse(rootContract).name).name;
  
      // prepare the init data cell
      const deployInitScript = require(__dirname + "/../" + rootContract);
      if (typeof deployInitScript.initData !== "function") {
        console.log(` - ERROR: '${rootContract}' does not have 'initData()' function`);
        process.exit(1);
      }
      const initDataCell = deployInitScript.initData() as Cell;
  
      // prepare the init message
      if (typeof deployInitScript.initMessage !== "function") {
        console.log(` - ERROR: '${rootContract}' does not have 'initMessage()' function`);
        process.exit(1);
      }
      const initMessageCell = deployInitScript.initMessage() as Cell | null;
  
      // prepare the init code cell
      const hexArtifact = `build/${contractName}.compiled.json`;
      if (!fs.existsSync(hexArtifact)) {
        console.log(` - ERROR: '${hexArtifact}' not found, did you build?`);
        process.exit(1);
      }
      const initCodeCell = Cell.fromBoc(JSON.parse(fs.readFileSync(hexArtifact).toString()).hex)[0];
  
      // make sure the contract was not already deployed
      const newContractAddress = contractAddress({ workchain, initialData: initDataCell, initialCode: initCodeCell });
      console.log(` - Based on your init code+data, your new contract address is: ${newContractAddress.toFriendly()}`);
      if (await client.isContractDeployed(newContractAddress)) {
        console.log(` - Looks like the contract is already deployed in this address, skipping deployment`);
        await performPostDeploymentTest(rootContract, deployInitScript, walletContract, walletKey.secretKey, newContractAddress);
        continue;
      }
  
      // deploy by sending an internal message to the deploying wallet
      console.log(` - Let's deploy the contract on-chain..`);
      const seqno = await walletContract.getSeqNo();
      const transfer = walletContract.createTransfer({
        secretKey: walletKey.secretKey,
        seqno: seqno,
        sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
        order: new InternalMessage({
          to: newContractAddress,
          value: newContractFunding,
          bounce: false,
          body: new CommonMessageInfo({
            stateInit: new StateInit({ data: initDataCell, code: initCodeCell }),
            body: initMessageCell !== null ? new CellMessage(initMessageCell) : null,
          }),
        }),
      });
      await client.sendExternalMessage(walletContract, transfer);
      console.log(` - Deploy transaction sent successfully`);
  
      // make sure that the contract was deployed
      console.log(` - Block explorer link: https://${process.env.TESTNET ? "test." : ""}tonwhales.com/explorer/address/${newContractAddress.toFriendly()}`);
      console.log(` - Waiting up to 20 seconds to check if the contract was actually deployed..`);
      for (let attempt = 0; attempt < 10; attempt++) {
        await sleep(2000);
        const seqnoAfter = await walletContract.getSeqNo();
        if (seqnoAfter > seqno) break;
      }
      if (await client.isContractDeployed(newContractAddress)) {
        console.log(` - SUCCESS! Contract deployed successfully to address: ${newContractAddress.toFriendly()}`);
        const contractBalance = await client.getBalance(newContractAddress);
        console.log(` - New contract balance is now ${fromNano(contractBalance)} TON, make sure it has enough to pay rent`);
        await performPostDeploymentTest(rootContract, deployInitScript, walletContract, walletKey.secretKey, newContractAddress);
      } else {
        console.log(` - FAILURE! Contract address still looks uninitialized: ${newContractAddress.toFriendly()}`);
      }
    }
    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      
      async function performPostDeploymentTest(rootContract: string, deployInitScript: any, walletContract: WalletContract, secretKey: Buffer, newContractAddress: Address) {
        if (typeof deployInitScript.postDeployTest !== "function") {
          console.log(` - Not running a post deployment test, '${rootContract}' does not have 'postDeployTest()' function`);
          return;
        }
        console.log(` - Running a post deployment test:`);
        await deployInitScript.postDeployTest(walletContract, secretKey, newContractAddress);
      }
  }
  
} 