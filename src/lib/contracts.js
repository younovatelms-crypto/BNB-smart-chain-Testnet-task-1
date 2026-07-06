import { ethers } from "ethers";
import { ERC20_ABI, TSC_ABI } from "./abis";

// ---- Network config (from .env) ----
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 97);
export const CHAIN_ID_HEX = import.meta.env.VITE_CHAIN_ID_HEX || "0x61";
export const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME || "BNB Smart Chain Testnet";
export const RPC_URL = import.meta.env.VITE_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/";
export const EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL || "https://testnet.bscscan.com";

export const ADD_CHAIN_PARAMS = {
  chainId: CHAIN_ID_HEX,
  chainName: CHAIN_NAME,
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: [EXPLORER_URL],
};

// ---- Contract addresses (from .env) ----
export const MUSDT_ADDRESS = import.meta.env.VITE_MUSDT_ADDRESS;
export const TTRS_ADDRESS = import.meta.env.VITE_TTRS_ADDRESS;
export const TSC_ADDRESS = import.meta.env.VITE_TSC_ADDRESS;

// ---- Decimals (from .env) ----
export const MUSDT_DECIMALS = Number(import.meta.env.VITE_MUSDT_DECIMALS || 6);
export const TTRS_DECIMALS = Number(import.meta.env.VITE_TTRS_DECIMALS || 18);

// ---- Fixed trade sizes (from .env) ----
export const BUY_MUSDT_AMOUNT_HUMAN = import.meta.env.VITE_BUY_MUSDT_AMOUNT || "10";
export const BUY_TTRS_AMOUNT_HUMAN = import.meta.env.VITE_BUY_TTRS_AMOUNT || "10";
export const SELL_TTRS_AMOUNT_HUMAN = import.meta.env.VITE_SELL_TTRS_AMOUNT || "10";
export const SELL_MUSDT_AMOUNT_HUMAN = import.meta.env.VITE_SELL_MUSDT_AMOUNT || "9";

export const BUY_MUSDT_AMOUNT = ethers.utils.parseUnits(BUY_MUSDT_AMOUNT_HUMAN, MUSDT_DECIMALS);
export const SELL_TTRS_AMOUNT = ethers.utils.parseUnits(SELL_TTRS_AMOUNT_HUMAN, TTRS_DECIMALS);
export const SELL_MUSDT_MIN_RESERVE = ethers.utils.parseUnits(SELL_MUSDT_AMOUNT_HUMAN, MUSDT_DECIMALS);

// ---- Contract factories ----
export function getMusdtContract(signerOrProvider) {
  return new ethers.Contract(MUSDT_ADDRESS, ERC20_ABI, signerOrProvider);
}

export function getTtrsContract(signerOrProvider) {
  return new ethers.Contract(TTRS_ADDRESS, ERC20_ABI, signerOrProvider);
}

export function getTscContract(signerOrProvider) {
  return new ethers.Contract(TSC_ADDRESS, TSC_ABI, signerOrProvider);
}

export function explorerTxUrl(hash) {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function explorerAddressUrl(address) {
  return `${EXPLORER_URL}/address/${address}`;
}
