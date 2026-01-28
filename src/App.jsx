import { useState } from "react";
import "./App.css";
import { Header } from "./Header/Header.jsx";
import { Upload } from "./Upload/Upload.jsx";
import { Social } from "./Social/Social.jsx";
import { useWalletSelector } from "@near-wallet-selector/react-hook";

function App() {
  const { signedAccountId: accountId } = useWalletSelector();
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="container-fluid">
      <Header accountId={accountId} />
      <div className="container mb-5">
        {accountId ? (
          <div>
            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`nav-link ${activeTab === "upload" ? "active" : ""}`}
                >
                  📁 File Upload
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab("social")}
                  className={`nav-link ${activeTab === "social" ? "active" : ""}`}
                >
                  👥 Social Graph
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            {activeTab === "upload" ? (
              <Upload key="upload" />
            ) : (
              <Social key="social" />
            )}
          </div>
        ) : (
          <div className="alert alert-warning" role="alert">
            Please Sign In
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
