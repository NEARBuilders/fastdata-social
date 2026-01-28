/**
 * Validates NEAR account ID format
 * Supports both named accounts (*.near, *.testnet) and implicit accounts (64-char hex)
 * @param {string} accountId - The account ID to validate
 * @returns {boolean} - Whether the account ID is valid
 */
export function isValidNearAccount(accountId) {
  if (!accountId) return false;

  // Named account: must end with .near or .testnet
  if (accountId.endsWith(".near") || accountId.endsWith(".testnet")) {
    const name = accountId.split(".")[0];
    // Must be lowercase, alphanumeric, underscores, hyphens
    // Length: 2-64 characters
    return (
      /^[a-z0-9_-]+$/.test(name) && name.length >= 2 && name.length <= 64
    );
  }

  // Implicit account: 64 character hex string
  if (accountId.length === 64) {
    return /^[0-9a-f]{64}$/.test(accountId);
  }

  return false;
}

/**
 * Formats account ID for display
 * Truncates long implicit accounts for better UX
 * @param {string} accountId - The account ID to format
 * @returns {string} - Formatted account ID
 */
export function formatAccountId(accountId) {
  if (!accountId) return "";

  // Truncate long implicit accounts for display
  if (accountId.length === 64) {
    return `${accountId.slice(0, 8)}...${accountId.slice(-8)}`;
  }

  return accountId;
}

/**
 * Generates transaction explorer URL
 * @param {string} txHash - Transaction hash
 * @param {string} explorerUrl - Base explorer URL (from constants)
 * @returns {string} - Full explorer URL
 */
export function getTxExplorerUrl(txHash, explorerUrl) {
  return `${explorerUrl}/${txHash}`;
}
