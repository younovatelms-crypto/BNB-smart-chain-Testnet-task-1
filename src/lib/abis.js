// Minimal ERC20 ABI — only what the dashboard needs.
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// TSC (Test Sale Contract) ABI.
//
// NOTE: the assignment brief did not include the deployed contract's real ABI.
// This is assumed based on the spec:
//   - getTSCBalances() -> (musdtReserve, ttrsReserve)
//   - buyTTRS()  -> no-arg, pulls the previously approved mUSDT from msg.sender
//   - sellTTRS() -> no-arg, pulls the previously approved TTRS from msg.sender
//
// If the real contract differs (e.g. takes an amount parameter, or returns
// reserves in the opposite order), update this file only — nothing else
// in the app needs to change.
export const TSC_ABI = [
  "function getTSCBalances() view returns (uint256, uint256)",
  "function buyTTRS() returns (bool)",
  "function sellTTRS() returns (bool)",
];
