import express from "express";
import { DeployService } from "../../build/deploy-service";
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const deployService = new DeployService(true); // true for testnet

app.post("/api/deploy", async (req, res) => {
  try {
    const { name, symbol, image, description, ownerAddress, amount } = req.body;
    
    // Validate required parameters
    if (!name || !symbol || !image || !description || !ownerAddress || !amount) {
      return res.status(400).json({ 
        error: "Missing required parameters" 
      });
    }

    const result = await deployService.deployJetton({
      name,
      symbol, 
      image,
      description,
      ownerAddress,
      amount
      // deployerMnemonic
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

app.get("/api/jettons", async (req, res) => {
  try {
    const jettons = await deployService.getJettons();
    res.json({
      success: true,
      data: jettons
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 