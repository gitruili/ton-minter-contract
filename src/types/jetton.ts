interface JettonMint {
  id: string;
  name: string;
  symbol: string;
  image: string;
  description: string;
  ownerAddress: string;
  contractAddress: string;
  totalSupply: string;  // Store as string due to BN/large numbers
  createdAt: Date;
  mintTransactions: MintTransaction[];
}

interface MintTransaction {
  id: string;
  jettonId: string;
  recipientAddress: string;
  amount: string;
  transactionHash: string;
  timestamp: Date;
}
