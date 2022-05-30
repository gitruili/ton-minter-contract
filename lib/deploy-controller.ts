import BN from "bn.js";
import { Address, beginCell, Cell, CommonMessageInfo, InternalMessage, StateInit, toNano, TonClient, Wallet, contractAddress, WalletContract, WalletV3R1Source, WalletV3R2Source, SendMode, CellMessage } from 'ton';
import fs from 'fs';
import { data } from '../contracts/jetton-wallet';
import { mnemonicToWalletKey } from 'ton-crypto';
const minterCode = "B5EE9C72410209010001AA000114FF00F4A413F4BCF2C80B0102016202030202CC040502037A60070801D5D9910E38048ADF068698180B8D848ADF07D201800E98FE99FF6A2687D007D206A6A18400AA9385D47181A9AA8AAE382F9702480FD207D006A18106840306B90FD001812881A28217804502A906428027D012C678B666664F6AA7041083DEECBEF0BDD71812F83C207F9784060093DFC142201B82A1009AA0A01E428027D012C678B00E78B666491646580897A007A00658064907C80383A6465816503E5FFE4E83BC00C646582AC678B28027D0109E5B589666664B8FD80400FC03FA00FA40F82854120870542013541403C85004FA0258CF1601CF16CCC922C8CB0112F400F400CB00C9F9007074C8CB02CA07CBFFC9D05008C705F2E04A12A1035024C85004FA0258CF16CCCCC9ED5401FA403020D70B01C3008E1F8210D53276DB708010C8CB055003CF1622FA0212CB6ACB1FCB3FC98042FB00915BE2007DADBCF6A2687D007D206A6A183618FC1400B82A1009AA0A01E428027D012C678B00E78B666491646580897A007A00658064FC80383A6465816503E5FFE4E840001FAF16F6A2687D007D206A6A183FAA9040F6B06B3C" // "b5ee9c72c1020b010001ed000000000d00120018002a006b007000bc01390152016c0114ff00f4a413f4bcf2c80b01020162050202037a600403001faf16f6a2687d007d206a6a183faa9040007dadbcf6a2687d007d206a6a183618fc1400b82a1009aa0a01e428027d012c678b00e78b666491646580897a007a00658064fc80383a6465816503e5ffe4e8400202cc07060093b3f0508806e0a84026a8280790a009f404b19e2c039e2d99924591960225e801e80196019241f200e0e9919605940f97ff93a0ef003191960ab19e2ca009f4042796d625999992e3f60103efd9910e38048adf068698180b8d848adf07d201800e98fe99ff6a2687d007d206a6a18400aa9385d47181a9aa8aae382f9702480fd207d006a18106840306b90fd001812881a28217804d02a906428027d012c678b666664f6aa7041083deecbef29385d71811a92e001f1811802600271812f82c207f97840a0908002e5143c705f2e049d43001c85004fa0258cf16ccccc9ed5400303515c705f2e049fa403059c85004fa0258cf16ccccc9ed5400fe3603fa00fa40f82854120870542013541403c85004fa0258cf1601cf16ccc922c8cb0112f400f400cb00c9f9007074c8cb02ca07cbffc9d05008c705f2e04a12a1035024c85004fa0258cf16ccccc9ed5401fa403020d70b01c3008e1f8210d53276db708010c8cb055003cf1622fa0212cb6acb1fcb3fc98042fb00915be2cc665c46";
const walletCode = "B5EE9C7241021101000319000114FF00F4A413F4BCF2C80B0102016202030202CC0405001BA0F605DA89A1F401F481F481A8610201D40607020148080900BB0831C02497C138007434C0C05C6C2544D7C0FC02F83E903E900C7E800C5C75C87E800C7E800C00B4C7E08403E29FA954882EA54C4D167C0238208405E3514654882EA58C4CD00CFC02780D60841657C1EF2EA4D67C02B817C12103FCBC2000113E910C1C2EBCB853600201200A0B0201200F1001F500F4CFFE803E90087C007B51343E803E903E90350C144DA8548AB1C17CB8B04A30BFFCB8B0950D109C150804D50500F214013E809633C58073C5B33248B232C044BD003D0032C032483E401C1D3232C0B281F2FFF274013E903D010C7E801DE0063232C1540233C59C3E8085F2DAC4F3208405E351467232C7C6600C02F13B51343E803E903E90350C01F4CFFE80145468017E903E9014D6B1C1551CDB1C150804D50500F214013E809633C58073C5B33248B232C044BD003D0032C0327E401C1D3232C0B281F2FFF274140331C146EC7CB8B0C27E8020822625A020822625A02806A8486544124E17C138C34975C2C070C00930802C200D0E008ECB3F5007FA0222CF165006CF1625FA025003CF16C95005CC07AA0013A08208989680AA008208989680A0A014BCF2E2C504C98040FB001023C85004FA0258CF1601CF16CCC9ED54006C5219A018A182107362D09CC8CB1F5240CB3F5003FA0201CF165007CF16C9718018C8CB0525CF165007FA0216CB6A15CCC971FB00103400828E2A820898968072FB028210D53276DB708010C8CB055008CF165005FA0216CB6A13CB1F13CB3FC972FB0058926C33E25502C85004FA0258CF1601CF16CCC9ED5400DB3B51343E803E903E90350C01F4CFFE803E900C145468549271C17CB8B049F0BFFCB8B0A0822625A02A8005A805AF3CB8B0E0841EF765F7B232C7C572CFD400FE8088B3C58073C5B25C60043232C14933C59C3E80B2DAB33260103EC01004F214013E809633C58073C5B3327B55200083200835C87B51343E803E903E90350C0134C7E08405E3514654882EA0841EF765F784EE84AC7CB8B174CFCC7E800C04E81408F214013E809633C58073C5B3327B55204F664B79" // // "b5ee9c72c1021201000328000000000d001200220027002c00700075007a00ea016b01a801b101eb026902b802bd02c80114ff00f4a413f4bcf2c80b010201620302001ba0f605da89a1f401f481f481a8610202cc0f0402012006050083d40106b90f6a2687d007d207d206a1802698fc1080bc6a28ca9105d41083deecbef09dd0958f97162e99f98fd001809d02811e428027d012c678b00e78b6664f6aa40201200d07020120090800db3b51343e803e903e90350c01f4cffe803e900c145468549271c17cb8b049f0bffcb8b0a0822625a02a8005a805af3cb8b0e0841ef765f7b232c7c572cfd400fe8088b3c58073c5b25c60063232c14933c59c3e80b2dab33260103ec01004f214013e809633c58073c5b3327b552003f73b51343e803e903e90350c0234cffe80145468017e903e9014d6f1c1551cdb5c150804d50500f214013e809633c58073c5b33248b232c044bd003d0032c0327e401c1d3232c0b281f2fff274140371c1472c7cb8b0c2be80146a2860822625a020822625a004ad822860822625a028062849f8c3c975c2c070c008e00c0b0a0076c200b08e218210d53276db708010c8cb055008cf165004fa0216cb6a12cb1f12cb3fc972fb0093356c21e203c85004fa0258cf1601cf16ccc9ed54000e10491038375f0400705279a018a182107362d09cc8cb1f5230cb3f58fa025007cf165007cf16c9718018c8cb0524cf165006fa0215cb6a14ccc971fb001024102301f5503d33ffa00fa4021f001ed44d0fa00fa40fa40d4305136a1522ac705f2e2c128c2fff2e2c254344270542013541403c85004fa0258cf1601cf16ccc922c8cb0112f400f400cb00c920f9007074c8cb02ca07cbffc9d004fa40f40431fa00778018c8cb055008cf1670fa0217cb6b13cc8210178d4519c8cb1f1980e009acb3f5007fa0222cf165006cf1625fa025003cf16c95005cc2391729171e25008a813a08208989680aa008208989680a0a014bcf2e2c504c98040fb001023c85004fa0258cf1601cf16ccc9ed540201d4111000113e910c1c2ebcb8536000bb0831c02497c138007434c0c05c6c2544d7c0fc03383e903e900c7e800c5c75c87e800c7e800c00b4c7e08403e29fa954882ea54c4d167c0278208405e3514654882ea58c511100fc02b80d60841657c1ef2ea4d67c02f817c12103fcbc20c2d0bee8";

const api = "https://sandbox.tonhubapi.com/jsonRPC"  //"https://testnet-api.scaleton.io"


// export class DeployControllerFactory {

//     static create(): DeployController {

//         const client = new TonClient({
//             endpoint: "https://mainnet.tonhubapi.com/jsonRPC" // `https://${process.env.TESTNET ? 'testnet.' : ''}toncenter.com/api/v2/jsonRPC`, 
//             // apiKey: process.env.TESTNET ? process.env.TESTNET_API_KEY : process.env.MAINNET_API_KEY
//         });

//         return new DeployController(
//             client,
//             new MyContractDeployer(),
//             new TonChromeExtTransactionSender(),
//         )
//     }

// }

interface TransactionSender {
    sendTransaction(transactionDetails: TransactionDetails): Promise<void>;
}

interface TransactionDetails {
    to: Address,
    value: BN,
    stateInit: StateInit,
    message?: any // TODO
}

interface ContractDeployer {
    deployContract(contract: ContractDeployDetails, transactionSender: TransactionSender): Promise<void>;
}

interface ContractDeployDetails {
    deployer: Address,
    value: BN,
    code: Cell,
    data: Cell,
    message?: any // TODO
}


class MyContractDeployer implements ContractDeployer {
    async deployContract(contract: ContractDeployDetails, transactionSender: TransactionSender): Promise<void> {

        const minterAddress = contractAddress({ workchain: 0, initialData: contract.data, initialCode: contract.code });

        await transactionSender.sendTransaction({
            to: minterAddress,
            value: contract.value,
            stateInit: new StateInit({ data: contract.data, code: contract.code }),
            message: null
        });

    }
}


class ChromeExtensionTransactionSender implements TransactionSender {
    async sendTransaction(transactionDetails: TransactionDetails): Promise<void> {
        // @ts-ignore
        const ton = window.ton as any;

        if (!ton) throw new Error("Missing ton chrome extension")

        const INIT_CELL = new Cell()
        transactionDetails.stateInit.writeTo(INIT_CELL);

        const b64InitCell = INIT_CELL.toBoc().toString('base64')

        console.log(`sending : ${transactionDetails.to.toFriendly()}`)

        ton.send('ton_sendTransaction', [
            {
                to: transactionDetails.to.toFriendly(),
                value: transactionDetails.value.toString(),
                data: null,
                dataType: 'boc',
                stateInit: b64InitCell,
            }
        ]);
    }
}



class PrivKeyTransactionSender implements TransactionSender {
    async sendTransaction(transactionDetails: TransactionDetails): Promise<void> {
        const c = new TonClient({
            endpoint: api
        });

        const mnemonic = [
            "napkin",
           
        ];

        const wk = await mnemonicToWalletKey(mnemonic)

        const walletContract = WalletContract.create(c, WalletV3R1Source.create({
            publicKey: wk.publicKey,
            workchain: 0
        }));

        const seqno = await walletContract.getSeqNo();

        /* 
            FOR FUN
        */

        const INIT_CELL = new Cell()
        transactionDetails.stateInit.writeTo(INIT_CELL);

        const ENC: any = {
            "+": "-",
            "/": "_",
            "=": ".",
        };
        const b64InitCell = INIT_CELL.toBoc().toString('base64')
            .replace(/[+/=]/g, (m) => {
                return ENC[m];
            });

        const c0 = INIT_CELL.refs[1].beginParse()
        c0.readCoins()
        console.log(c0.readAddress()?.toFriendly())

        // const stateInitCell = .refs[1].beginParse()



        const transfer = walletContract.createTransfer({
            secretKey: wk.secretKey,
            seqno: seqno,
            sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
            order: new InternalMessage({
                to: transactionDetails.to,
                value: transactionDetails.value,
                bounce: false,
                body: new CommonMessageInfo({
                    // stateInit: transactionDetails.stateInit,
                    stateInit: new CellMessage(
                        Cell.fromBoc(
                            Buffer.from(b64InitCell, 'base64')
                        )[0]
                    ),
                    body: null
                }),
            }),
        });

        await c.sendExternalMessage(walletContract, transfer);
    }
}

function encodeBase64URL(buffer: Buffer): string {
    const ENC: any = {
        "+": "-",
        "/": "_",
        "=": ".",
    };
    return buffer.toString('base64')
        .replace(/[+/=]/g, (m) => {
            return ENC[m];
        });
}

class TonDeepLinkTransactionSender implements TransactionSender {
    async sendTransaction(transactionDetails: TransactionDetails): Promise<void> {
        if (!global['open']) throw new Error("Missing open url web API")

        const INIT_CELL = new Cell()
        transactionDetails.stateInit.writeTo(INIT_CELL);
        const b64InitCell = encodeBase64URL(INIT_CELL.toBoc())

        const link = `ton-test://transfer/${transactionDetails.to.toFriendly()}?amount=${transactionDetails.value}&init=${b64InitCell}`;
        open(link)
    }
}



export class DeployController {
    #client: TonClient;
    #contractDeployer: ContractDeployer;
    #transactionSender: TransactionSender;

    constructor(
        client: TonClient,
        contractDeployer: ContractDeployer,
        transactionSender: TransactionSender) {
        this.#client = client;
        this.#contractDeployer = contractDeployer;
        this.#transactionSender = transactionSender;
    }

    async createJetton(
        ownerAddress: string // TODO address?
    ) {
        const address = Address.parse("kQDBQnDNDtDoiX9np244sZmDcEyIYmMcH1RiIxh59SRpKZsb")
        // const balance = await this.#client.getBalance(address)

        // TODO check balance



        // this.#client.sendExternalMessage()

        // TODO - how/should we use the deployer here?

        /*
            1. Upload image to IPFS? expose API KEY?
            2. Upload JSON to IPFS?
            3. Deploy contract?
            4. Mint to owner?
        */

        // Assume we've uploaded to IPFS

        const ipfsImageLink = "...";
        const ipfsJsonLinkk = "...";

        try {
            await this.#contractDeployer.deployContract(
                // JettonContract.createFrom(jettonDetails, JettonContract.mint(to...)),
                {
                    code: Cell.fromBoc(minterCode)[0],
                    data: beginCell()
                        .storeCoins(16)
                        .storeAddress(address)
                        .storeRef(beginCell().endCell()) // TODO
                        .storeRef(Cell.fromBoc(walletCode)[0])
                        .endCell(),
                    deployer: address,
                    value: toNano(0.25)
                },
                this.#transactionSender
            )
        } catch (e) {
            // TODO deploy-specific errors
            throw e;
        }

        // Assuming contract was deployed with mint

    }


    async #deployContract(params: any) {



    }

}

export async function doThing() {
    const client = new TonClient({
        endpoint: api
    });

    // async function createWalletAndSerialize(client: TonClient, walletName: string) {
    //     const { wallet, mnemonic, key } = await client.createNewWallet({
    //         workchain: 0,
    //     });

    //     fs.writeFileSync("wallet1", JSON.stringify({
    //         address: wallet.address.toFriendly(),
    //         key,
    //         mnemonic
    //     }));
    // }

    // console.log(
    //     (await client.getBalance(Address.parse("kQDBQnDNDtDoiX9np244sZmDcEyIYmMcH1RiIxh59SRpKZsb")))
    // );

    const dc = new DeployController(
        client,
        new MyContractDeployer(),
        new TonDeepLinkTransactionSender()
        // new PrivKeyTransactionSender()
        // new ChromeExtensionTransactionSender()
    );

    await dc.createJetton("kQDBQnDNDtDoiX9np244sZmDcEyIYmMcH1RiIxh59SRpKZsb") // SANDBOX
    // await dc.createJetton("EQA6j4K2gZOIG6wHaijLWBf9k6II8FPAAQnSDHyQZNYMndOI") // TESTNET

    // const addr = "kQDIl8tncyge15Qrn26u2e3JDkRgKx4jzBGAdN-AtehybGGu"
    const addr = "kQDQLOmiD-6ngqcXfvJ0EJaBbesa2VcoLrgClc_ARofF-GdP"

    const isDeployed = await client.isContractDeployed(Address.parse(addr));

    console.log(isDeployed)

    const res = await client.callGetMethod(
        Address.parse(addr),
        "get_jetton_data"
    )

    console.log(res.stack[0][1])
}

(async () => {

    // await doThing()


})()