import Snabbdom from "snabbdom-pragma";


export default ({activeTab}) => (
  <div className="navbar-secondary">
      <div className="container title-bar-recent">
        <a href="." class={{ active: activeTab == "recentBlocks" }}>Blocks</a>
        <a href="tx/recent" class={{ active: activeTab == "recentTxs" }}>Transactions</a>
        <a href="/assets" class={{ active: activeTab == "Assets" }}>Assets</a>
      </div>
  </div>
);
