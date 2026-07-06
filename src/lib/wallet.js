import { ethers } from "ethers";
import { CHAIN_ID, CHAIN_ID_HEX, ADD_CHAIN_PARAMS } from "./contracts";

export function hasMetaMask() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export async function connect() {
  if (!hasMetaMask()) {
    throw new Error("MetaMask not detected. Please install the MetaMask browser extension.");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

/**
 * Checks the connected network and, if it's wrong, attempts to switch
 * (or add) BNB Smart Chain Testnet in the wallet.
 * Returns true if the network is correct after this call.
 */
export async function ensureCorrectNetwork(provider) {
  const network = await provider.getNetwork();
  if (network.chainId === CHAIN_ID) return true;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchErr) {
    if (switchErr.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [ADD_CHAIN_PARAMS],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

/**
 * Converts raw ethers/MetaMask errors into short, user-readable messages.
 */
export function friendlyError(err) {
  if (!err) return "Unknown error.";
  const raw = err.reason || err.data?.message || err.error?.message || err.message || String(err);
  const msg = raw.toLowerCase();

  if (err.code === 4001 || msg.includes("user rejected") || msg.includes("user denied")) {
    return "Rejected in wallet. Nothing was sent.";
  }
  if (msg.includes("insufficient funds")) {
    return "Insufficient tBNB balance to pay for gas.";
  }
  if (msg.includes("insufficient allowance") || msg.includes("allowance")) {
    return "Approval amount is too low. Please approve first.";
  }
  if (msg.includes("transfer amount exceeds balance") || msg.includes("exceeds balance")) {
    return "Insufficient token balance for this action.";
  }
  if (msg.includes("reserve")) {
    return "TSC contract does not have enough reserve for this trade.";
  }
  if (msg.includes("network changed") || msg.includes("underlying network")) {
    return "Network changed mid-transaction. Please refresh and try again.";
  }
  return raw.length > 180 ? raw.slice(0, 180) + "…" : raw;
}
