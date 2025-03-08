import React, { useState, useEffect, useRef } from "react";
import './styles/components/FastNearAuth.css';

// Authentication component for NEAR testnet
// Remove all inline styles and use CSS classes instead
const FastNearAuth = ({ 
  near, 
  contractId = "fastnear.testnet", // Using testnet contract
  accountId = "",
  publicKey = "",
  isSignedIn = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const authRef = useRef(null);
  const expandedContentRef = useRef(null);
  const accountNameRef = useRef(null);
  const nearContractRef = useRef(null);
  const publicKeyRef = useRef(null);

  // Handle click on the auth container
  const handleAuthClick = () => {
    setIsExpanded(!isExpanded);
  };

  // Sign in with NEAR testnet
  const handleSignIn = () => {
    if (!near) return;
    near.requestSignIn({ contractId });
  };

  // Sign out from NEAR testnet
  const handleSignOut = (e) => {
    e.stopPropagation(); // Prevent triggering auth click
    if (!near) return;
    near.signOut();
  };

  const handleCopy = async (e) => {
    e.stopPropagation(); // Prevent triggering auth click
    const copyText = e.currentTarget.getAttribute("data-copy");
    if (copyText) {
      try {
        await navigator.clipboard.writeText(copyText);
        // Add visual feedback
        if (authRef.current) {
          authRef.current.classList.add("copy-flash");
          setTimeout(() => authRef.current.classList.remove("copy-flash"), 200);
        }
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  // Format public key for display
  const formatPublicKey = () => {
    if (!publicKey) return { initial: "?", truncated: "..." };
    
    const [curveType, hexPayload] = publicKey.split(":");
    const initial = curveType ? curveType[0].toUpperCase() : "?";
    const truncated = hexPayload 
      ? `${hexPayload.slice(0, 8)}…${hexPayload.slice(-8)}`
      : "...";
      
    return { initial, truncated };
  };

  // Set up click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authRef.current && !authRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isSignedIn) {
    const { initial, truncated } = formatPublicKey();
    
    return (
      <div 
        ref={authRef}
        id="auth" 
        className={`user-info pointer ${isExpanded ? 'expanded' : 'collapsed'}`}
        onClick={handleAuthClick}
      >
        <div id="auth-logged-in" className="flex flex-column items-center w-100">
          <div className="account-name truncate w-100 tc white-90">
            {accountId}
            {isExpanded && <div className="auth-arrow"></div>}
          </div>
          <div 
            ref={expandedContentRef}
            className={`expanded-content ${isExpanded ? '' : 'dn'} w-100`}
          >
            <div 
              ref={nearContractRef}
              className="near-contract copyable pa1 ma2 lightest-blue tc pb0 mb1" 
              data-copy={contractId}
              onClick={handleCopy}
            >
              {contractId}
            </div>
            
            <div 
              ref={publicKeyRef}
              className="near-public-key copyable pa1 ma2 pt0 lightest-blue tc flex items-center" 
              data-copy={publicKey}
              onClick={handleCopy}
            >
              <div className="public-key-square-initial bg-light-green dark-gray w1 h1 flex items-center justify-center f5 fw6 mr2">
                {initial}
              </div>
              <div className="public-key-truncated white-80 truncate w-100 tc f7 code">
                {truncated}
              </div>
            </div>
            
            <button 
              id="sign-out"
              className="mt3 ba pointer signout-button"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div id="auth" className="user-info pointer">
        <button
          id="sign-in"
          className="pointer sign-in-button"
          onClick={handleSignIn}
        >
          Sign In
        </button>
      </div>
    );
  }
};

export default FastNearAuth;
