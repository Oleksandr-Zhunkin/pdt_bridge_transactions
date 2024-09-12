"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
require("dotenv/config");
const { PRIVATE_KEY, API_KEY, CONTRACT_ETH_TO_BASE, CONTRACT_BASE_TO_ETH } = process.env;
if (!PRIVATE_KEY ||
    !API_KEY ||
    !CONTRACT_ETH_TO_BASE ||
    !CONTRACT_BASE_TO_ETH) {
    throw new Error("Not all environment variables are setting");
}
// const provider = new ethers.JsonRpcProvider(
//   `https://mainnet.infura.io/v3/${API_KEY}`
// );
const provider = new ethers_1.ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${API_KEY}`);
const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
const bridgeABI = [
    "function sendFunds(address toContract, uint256 amount) external returns (bool)",
    "event FundsTransferred(address indexed from, address indexed to, uint256 amount)",
];
const bridgeContractEthToBase = new ethers_1.ethers.Contract(CONTRACT_ETH_TO_BASE, bridgeABI, wallet);
const bridgeContractBaseToEth = new ethers_1.ethers.Contract(CONTRACT_BASE_TO_ETH, bridgeABI, wallet);
function sendFundsByContract(contractAddress, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const contract = new ethers_1.ethers.Contract(contractAddress, bridgeABI, wallet);
            const balance = yield provider.getBalance(wallet.address);
            console.log(`Balance: ${ethers_1.ethers.formatEther(balance)} ETH`);
            const tx = yield contract.sendFunds(wallet.address, amount);
            console.log(`Transaction hash: ${tx.hash}`);
            const receipt = yield tx.wait();
            console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
        }
        catch (error) {
            console.error("Error sending funds:", error);
        }
    });
}
function main(contract) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const amount = ethers_1.ethers.parseEther("0.0001");
            yield sendFundsByContract(contract, amount);
            console.log("Transaction completed successfully.");
        }
        catch (error) {
            console.error("Error in main function:", error);
        }
        finally {
        }
    });
}
main(CONTRACT_ETH_TO_BASE).catch((error) => {
    console.error(error);
    process.exit(1);
});
