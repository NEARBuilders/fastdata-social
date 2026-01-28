import { formatAccountId } from "../utils/validation.js";

/**
 * AccountList component displays a list of accounts (following or followers)
 *
 * @param {Object} props
 * @param {string[]} props.accounts - Array of account IDs
 * @param {Function} props.onUnfollow - Callback for unfollow action (only for following list)
 * @param {boolean} props.disabled - Whether interactions are disabled
 * @param {string} props.type - "following" or "followers"
 * @param {string} props.currentUser - Current user's account ID
 * @param {boolean} props.loading - Whether data is loading
 */
export function AccountList({
  accounts,
  onUnfollow,
  disabled,
  type,
  currentUser,
  loading,
}) {
  // Loading state
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-secondary">Loading {type}...</p>
      </div>
    );
  }

  // Empty state
  if (!accounts || accounts.length === 0) {
    const emptyMessage =
      type === "following"
        ? "Not following anyone yet. Enter an account above to follow."
        : "No followers yet.";

    return (
      <div className="text-center py-4 text-secondary">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="list-group">
      {accounts.map((accountId) => (
        <div
          key={accountId}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <code className="text-dark">{accountId}</code>
            {accountId.length === 64 && (
              <small className="text-muted ms-2">
                ({formatAccountId(accountId)})
              </small>
            )}
          </div>
          {type === "following" && onUnfollow && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onUnfollow(accountId)}
              disabled={disabled}
            >
              Unfollow
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
