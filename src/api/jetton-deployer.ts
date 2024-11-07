import { Address, Cell } from "ton";
import { jettonMinterInitData, JettonMetaDataKeys, JETTON_WALLET_CODE } from "../../build/jetton-minter.deploy";
// import { JETTON_WALLET_CODE } from "../../build/jetton-wallet.deploy";

export interface JettonDeployParams {
  owner: Address;
  name: string;
  symbol: string;
  image: string;
  description: string;
}

export class JettonDeployer {
  static createInitData(params: JettonDeployParams): Cell {
    const metadata: { [s in JettonMetaDataKeys]?: string } = {
      name: params.name,
      symbol: params.symbol,
      image: params.image,
      description: params.description,
    };

    return jettonMinterInitData(params.owner, metadata);
  }

  // You can reuse the same initMessage logic from jetton-minter.deploy.ts
  static createInitMessage(): Cell | null {
    return null; // Or implement custom init message logic if needed
  }

  static getJettonWalletCode(): Cell {
    return JETTON_WALLET_CODE;
  }
} 