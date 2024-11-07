-- CreateTable
CREATE TABLE "Jetton" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "totalSupply" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jetton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MintTransaction" (
    "id" TEXT NOT NULL,
    "jettonId" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MintTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Jetton_contractAddress_key" ON "Jetton"("contractAddress");

-- AddForeignKey
ALTER TABLE "MintTransaction" ADD CONSTRAINT "MintTransaction_jettonId_fkey" FOREIGN KEY ("jettonId") REFERENCES "Jetton"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
