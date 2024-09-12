import { ethers } from "ethers";

import "dotenv/config";

const { PRIVATE_KEY, API_KEY, CONTRACT_ETH_TO_BASE, CONTRACT_BASE_TO_ETH } =
  process.env;

if (
  !PRIVATE_KEY ||
  !API_KEY ||
  !CONTRACT_ETH_TO_BASE ||
  !CONTRACT_BASE_TO_ETH
) {
  throw new Error("Not all environment variables are setting");
}

const provider = new ethers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${API_KEY}`
);

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const bridgeABI = [
  "function sendFunds(address toContract, uint256 amount) external returns (bool)",
  "event FundsTransferred(address indexed from, address indexed to, uint256 amount)",
];

const bridgeContractEthToBase = new ethers.Contract(
  CONTRACT_ETH_TO_BASE,
  bridgeABI,
  wallet
);
const bridgeContractBaseToEth = new ethers.Contract(
  CONTRACT_BASE_TO_ETH,
  bridgeABI,
  wallet
);

async function sendFundsByContract(
  contractAddress: string,
  amount: ethers.BigNumberish
) {
  try {
    const contract = new ethers.Contract(contractAddress, bridgeABI, wallet);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

    const tx = await contract.sendFunds(wallet.address, amount);
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
  } catch (error) {
    console.error("Error sending funds:", error);
  }
}

async function main(contract: string) {
  try {
    const amount = ethers.parseEther("0.000001");

    await sendFundsByContract(contract, amount);
  } catch (error) {
    console.error("Error in main function:", error);
  } finally {
  }
}

main(CONTRACT_ETH_TO_BASE).catch((error) => {
  console.error(error);
  process.exit(1);
});
