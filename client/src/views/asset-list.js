import Snabbdom from 'snabbdom-pragma'
import { formatAssetAmount } from './util'
import layout from './layout'

export default ({ assetMap, assetIcons, assetDetailsList, t, ...S }) => {

  const assets = Object.entries(assetMap)
    .map(([ asset_id, [ domain, ticker, name ] ]) => ({ asset_id, domain, ticker, name  }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const getSupply = (asset) => {
    let { chain_stats = {}, mempool_stats = {} } = asset
    let has_blinded_issuances =
        chain_stats.has_blinded_issuances || mempool_stats.has_blinded_issuances
    let is_native_asset = !asset.issuance_txin
    let circulating = is_native_asset
        ? chain_stats.peg_in_amount +
          mempool_stats.peg_in_amount -
          chain_stats.peg_out_amount -
          mempool_stats.peg_out_amount -
          chain_stats.burned_amount -
          mempool_stats.burned_amount
        : has_blinded_issuances
        ? null
        : chain_stats.issued_amount +
          mempool_stats.issued_amount -
          chain_stats.burned_amount -
          mempool_stats.burned_amount;

    let totalSupply = circulating == null ? t`Confidential`
                    : formatAssetAmount(circulating, asset.precision, t) 
    return totalSupply
  }

  return layout(
    <div>
      <div className="jumbotron jumbotron-fluid h-auto">
        <div className="container">
          <h1>{t`Registered assets`}</h1>
        </div>
      </div>
      <div className="container">
        { !assets.length ? <p>{t`No registered assets`}</p>
        : <div className="assets-table">
              <div className="assets-table-row header">
                <div className="assets-table-cell">{t`Name`}</div>
                <div className="assets-table-cell ticker right-align">{t`Ticker`}</div>
                <div className="assets-table-cell right-align">{t`Total Supply`}</div>
                <div className="assets-table-cell right-align">{t`Issuer domain`}</div>
              </div>
              {assets.map(asset =>
                <div className="assets-table-link-row">
                  <a className="assets-table-row asset-data" href={`asset/${asset.asset_id}`}>
                    <div className="assets-table-cell" data-label={t`Name`}>
                    <div>
                      {assetIcons === null ? "" : 
                        assetIcons[`${asset.asset_id}`] === undefined ? 
                          <div className="asset-icon-placeholder"></div> :
                          <img src={`data:image/png;base64,${assetIcons[`${asset.asset_id}`]}`} className="asset-icon"/>}
                          <span>{asset.name}</span></div>
                    </div>
                    <div className="assets-table-cell ticker right-align" data-label={t`Ticker`}>{asset.ticker || <em>None</em>}</div>
                    <div className="assets-table-cell asset-id highlighted-text right-align">
                     {assetDetailsList[`${asset.asset_id}`] === undefined ? "" : getSupply(assetDetailsList[`${asset.asset_id}`])}
                    </div>
                    <div className="assets-table-cell right-align" data-label={t`Issuer domain`}>{asset.domain}</div>
                  </a>
                </div>
              )}
          </div>
        }
      </div>
    </div>
  , { assetMap, t, ...S }
  )
}
