import Snabbdom from "snabbdom-pragma";
import { formatAssetAmount } from "./util";

export default (assetHighlight, t) => {

    return(
        <div className="container asset-highlights">
            {assetHighlight.map((asset) =>
            <div className="highlight">
                <div className="highlight-name">
                    <span className="highlight-name-icon"></span>
                    <span className="highlight-name-text">{asset.ticker}</span>
                </div>
                <div className="highlight-value">
                    {!asset.chain_stats ? "" : 
                    (asset.chain_stats.has_blinded_issuances ? "Confidential" :
                    formatAssetAmount(asset.chain_stats.issued_amount, asset.precision, t))}
                </div>
            </div>
             )}
        </div>
    )
}
