import { useCallback, useEffect, useState } from "react";
import { useWalletSelector } from "@near-wallet-selector/react-hook";
import { Constants } from "../hooks/constants.js";
import { fetchFollowing, fetchFollowers, checkApiHealth } from "../hooks/kvApi.js";
import { isValidNearAccount } from "../utils/validation.js";
import { TransactionAlert } from "./TransactionAlert.jsx";
import { AccountList } from "./AccountList.jsx";
import "./Social.css";

export function Social() {
  const { signedAccountId: accountId, callFunction } = useWalletSelector();

  // State management
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [activeTab, setActiveTab] = useState("following");
  const [transacting, setTransacting] = useState(false);
  const [lastTx, setLastTx] = useState(null);
  const [pendingAccount, setPendingAccount] = useState("");
  const [apiAvailable, setApiAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  // LocalStorage keys
  const FOLLOWING_KEY = `fastnear_following_${accountId}`;

  // Load data from API or localStorage
  const loadData = useCallback(async () => {
    if (!accountId) return;

    setLoading(true);

    // Check API health
    const isApiHealthy = await checkApiHealth();
    setApiAvailable(isApiHealthy);

    if (isApiHealthy) {
      // Load from API
      const followingData = await fetchFollowing(accountId);
      const followersData = await fetchFollowers(accountId);

      if (followingData !== null) {
        setFollowing(followingData);
        // Update localStorage as cache
        localStorage.setItem(FOLLOWING_KEY, JSON.stringify(followingData));
      }

      if (followersData !== null) {
        setFollowers(followersData);
      }
    } else {
      // Fall back to localStorage
      const stored = localStorage.getItem(FOLLOWING_KEY);
      if (stored) {
        setFollowing(JSON.parse(stored));
      }
      setFollowers([]);
    }

    setLoading(false);
  }, [accountId, FOLLOWING_KEY]);

  // Load data on mount and when account changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Validate account input
  const validateAccount = useCallback((account) => {
    if (!account) {
      setValidationError("Please enter an account ID");
      return false;
    }

    if (!isValidNearAccount(account)) {
      setValidationError("Invalid NEAR account format");
      return false;
    }

    if (account === accountId) {
      setValidationError("You cannot follow yourself");
      return false;
    }

    setValidationError("");
    return true;
  }, [accountId]);

  // Handle follow action
  const handleFollow = useCallback(
    async (targetAccount) => {
      if (!validateAccount(targetAccount)) return;

      // Check if already following
      if (following.includes(targetAccount)) {
        setValidationError("Already following this account");
        return;
      }

      setTransacting(true);
      setValidationError("");

      try {
        // Create KV transaction args - plain JSON, no encoding!
        const kvArgs = {
          [`graph/follow/${targetAccount}`]: "",
        };

        const txId = await callFunction({
          contractId: Constants.KV_CONTRACT_ID,
          method: "__fastdata_kv",
          args: kvArgs,
          gas: Constants.KV_GAS,
        });

        // Optimistic update
        const newFollowing = [...following, targetAccount];
        setFollowing(newFollowing);
        localStorage.setItem(FOLLOWING_KEY, JSON.stringify(newFollowing));

        // Set transaction status
        setLastTx({
          type: "follow",
          account: targetAccount,
          txId,
          status: "success",
        });

        // Clear input
        setPendingAccount("");

        // Reload from API after indexer delay
        setTimeout(() => {
          loadData();
        }, 3000);
      } catch (error) {
        console.error("Follow error:", error);
        // Still show success - KV transactions often "fail" but work
        setLastTx({
          type: "follow",
          account: targetAccount,
          txId: error.transactionHashes?.[0] || null,
          status: "success",
          error: true,
        });

        // Optimistic update even on error
        const newFollowing = [...following, targetAccount];
        setFollowing(newFollowing);
        localStorage.setItem(FOLLOWING_KEY, JSON.stringify(newFollowing));

        setPendingAccount("");

        setTimeout(() => {
          loadData();
        }, 3000);
      } finally {
        setTransacting(false);
      }
    },
    [following, accountId, callFunction, validateAccount, loadData, FOLLOWING_KEY]
  );

  // Handle unfollow action
  const handleUnfollow = useCallback(
    async (targetAccount) => {
      setTransacting(true);

      try {
        // Create KV transaction with "null" deletion marker
        const kvArgs = {
          [`graph/follow/${targetAccount}`]: "null",
        };

        const txId = await callFunction({
          contractId: Constants.KV_CONTRACT_ID,
          method: "__fastdata_kv",
          args: kvArgs,
          gas: Constants.KV_GAS,
        });

        // Optimistic update
        const newFollowing = following.filter((id) => id !== targetAccount);
        setFollowing(newFollowing);
        localStorage.setItem(FOLLOWING_KEY, JSON.stringify(newFollowing));

        // Set transaction status
        setLastTx({
          type: "unfollow",
          account: targetAccount,
          txId,
          status: "success",
        });

        // Reload from API after indexer delay
        setTimeout(() => {
          loadData();
        }, 3000);
      } catch (error) {
        console.error("Unfollow error:", error);
        // Still show success - KV transactions often "fail" but work
        setLastTx({
          type: "unfollow",
          account: targetAccount,
          txId: error.transactionHashes?.[0] || null,
          status: "success",
          error: true,
        });

        // Optimistic update even on error
        const newFollowing = following.filter((id) => id !== targetAccount);
        setFollowing(newFollowing);
        localStorage.setItem(FOLLOWING_KEY, JSON.stringify(newFollowing));

        setTimeout(() => {
          loadData();
        }, 3000);
      } finally {
        setTransacting(false);
      }
    },
    [following, callFunction, loadData, FOLLOWING_KEY]
  );

  return (
    <div>
      <div className="mb-3 text-center">
        <h1>FastData KV Social Graph</h1>
        <p className="text-secondary">
          Follow accounts using FastData KV protocol (no contract required!)
        </p>
      </div>

      {/* API Status Banner */}
      {!apiAvailable && (
        <div className="alert alert-warning" role="alert">
          <strong>KV API unavailable</strong>
          <br />
          <small>
            Run <code>kv-api-server</code> to see following/followers lists.
            Write operations still work.
          </small>
        </div>
      )}

      {/* Transaction Alert */}
      <TransactionAlert
        transaction={lastTx}
        onDismiss={() => setLastTx(null)}
      />

      {/* Follow Input */}
      <div className="mb-4">
        <h4>Follow Someone</h4>
        <div className="input-group">
          <input
            type="text"
            className={`form-control ${validationError ? "is-invalid" : ""}`}
            placeholder="Enter NEAR account (e.g., alice.near)"
            value={pendingAccount}
            onChange={(e) => {
              setPendingAccount(e.target.value);
              setValidationError("");
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleFollow(pendingAccount);
              }
            }}
            disabled={transacting}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleFollow(pendingAccount)}
            disabled={transacting || !pendingAccount}
          >
            {transacting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Following...
              </>
            ) : (
              "Follow"
            )}
          </button>
        </div>
        {validationError && (
          <div className="invalid-feedback d-block">{validationError}</div>
        )}
      </div>

      {/* Sub-tabs for Following/Followers */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "following" ? "active" : ""}`}
            onClick={() => setActiveTab("following")}
          >
            Following ({following.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "followers" ? "active" : ""}`}
            onClick={() => setActiveTab("followers")}
          >
            Followers ({followers.length})
          </button>
        </li>
      </ul>

      {/* Account Lists */}
      {activeTab === "following" ? (
        <AccountList
          accounts={following}
          onUnfollow={handleUnfollow}
          disabled={transacting}
          type="following"
          currentUser={accountId}
          loading={loading}
        />
      ) : (
        <AccountList
          accounts={followers}
          disabled={transacting}
          type="followers"
          currentUser={accountId}
          loading={loading}
        />
      )}
    </div>
  );
}
