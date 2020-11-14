import Snabbdom from 'snabbdom-pragma'
import { formatAssetAmount } from './util'
import layout from './layout'

const staticRoot = process.env.STATIC_ROOT || ''
export default ({ assetMap, goAssetList, totalAssets, currentPage, loading, assetIcons, t, ...S }) => {
  
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

  const { startIndex, sortDir, sortField } = goAssetList
  const getSortDir = () => sortDir === 'asc' ? 'desc' : 'asc'

  return layout(
    <div>
      <div className="jumbotron jumbotron-fluid h-auto">
        <div className="container">
          <h1>{t`Registered assets`}</h1>
        </div>
      </div>
      <div className="container">
        { !assetMap.length ?  process.browser 
            ? <div className="load-more-container"><img src="img/Loading.gif" /></div>
            : <div className="load-more-container">
                <span className="asset-error">{t`Connection Error`}</span>
                <a className="load-more" href={`assets/registry?start_index=${startIndex == null ? 0 : startIndex}`}>
                  <span>{t`Reload`}</span>
                </a>
              </div>
          : <div className="assets-table">
              <div className="assets-table-row header">
                <a href={`/assets/registry?sort_field=name&sort_dir=${getSortDir()}`} 
                  className={`assets-table-cell sortable ${sortField === "name" ? sortDir : ""}`}>{t`Name`}
                </a>
                <a href={`/assets/registry?sort_field=ticker&sort_dir=${getSortDir()}`} 
                    className={`assets-table-cell ticker right-align sortable ${sortField === "ticker" ? sortDir : ""}`}>{t`Ticker`}
                </a>
                <div className="assets-table-cell supply right-align">{t`Total Supply`}</div>
                <a href={`/assets/registry?sort_field=domain&sort_dir=${getSortDir()}`} 
                    className={`assets-table-cell domain right-align sortable ${sortField === "domain" ? sortDir : ""}`}>{t`Issuer domain`}
                </a>
              </div>
              {assetMap.map(asset =>
                <div className="assets-table-link-row">
                  <a className="assets-table-row asset-data" href={`asset/${asset.asset_id}`}>
                    <div className="assets-table-cell" data-label={t`Name`}>
                      <div className="assets-table-name">
                        {assetIcons === null ? "" : 
                          assetIcons[`${asset.asset_id}`] === undefined ? 
                          <div className="asset-icon-placeholder"></div> :
                          <img src={`data:image/png;base64,${assetIcons[`${asset.asset_id}`]}`} className="asset-icon"/>}
                          <span>{asset.name}</span>
                      </div>
                    </div>
                    <div className="assets-table-cell ticker right-align" data-label={t`Ticker`}>{asset.ticker || <em>None</em>}</div>
                    <div className="assets-table-cell asset-id highlighted-text right-align" data-label={t`Total Supply`}>{getSupply(asset)}</div>
                    <div className="assets-table-cell right-align" data-label={t`Issuer domain`}>{asset.entity.domain}</div>
                  </a>
                </div>
              )}
                <div className="load-more-container">
                { paginationButtons(totalAssets, goAssetList) }
                </div>
          </div>
        }
      </div>
    </div>
  , { assetMap, t, ...S }
  )
}


const paginationButtons = (totalAssets, goAssetList) => {
  // Assets Per Page  
    const { startIndex, sortDir, sortField, limit } = goAssetList
    , maxVisibleButtons = 5
    , totalPage = Math.ceil(totalAssets / limit)
    , lastPage = limit * (totalPage - 1)
    , curPage = (startIndex / limit) + 1
    
    // Returns Array of Page Numbers
    const updateButtons = () => {
      let buttonsArray = []
      const { maxLeft, maxRight } = calculateMaxVisible()
      for(let pageNum = maxLeft; pageNum <= maxRight; pageNum++){
        buttonsArray.push(pageNum)
      }
      return buttonsArray
    }
    // Move current Page Button to the Middle
    const calculateMaxVisible = () => {
      let maxLeft = (curPage - Math.floor(maxVisibleButtons / 2))
      let maxRight = (curPage + Math.floor(maxVisibleButtons / 2))
      
      if(maxLeft < 1){
        maxLeft = 1
        maxRight = maxVisibleButtons
      }
      
      if(maxRight > totalPage){
        maxLeft = totalPage - (maxVisibleButtons - 1)
        maxRight = totalPage
        
          if(maxLeft < 1){ maxLeft = 1}
      }
      return { maxLeft, maxRight }
    }

    const pageLink = `assets/registry?sort_field=${sortField}&sort_dir=${sortDir}`
  
    return (
    <div className="pagination">
       {(Number(startIndex) - limit) < 0 ? "" :
        <div className="prev-first control">
            <a href={`${pageLink}&start_index=0`} 
                className="firstpage pagelink">&#10218;&#10218;
            </a>
            <a className="pagelink prev" 
                href={`${pageLink}&start_index=${Number(startIndex) - limit}`}>
              <div><img alt="" src={`${staticRoot}img/icons/arrow_left_blu.png`} /></div>
            </a>
        </div>}
        <div className="numbers">
          {updateButtons().map(pgNum => {
            const pageStartIndex = limit * (pgNum - 1)
            return <a href={`${pageLink}&start_index=${pageStartIndex}`} 
                      className={`pagelink ${pageStartIndex === Number(startIndex) ? 'current' : ""}`}>{pgNum}</a>
          })}
        </div>
        {(Number(startIndex) + limit) >= totalAssets ? "" :
        <div className="next-last control">
            <a className="pagelink next" href={`${pageLink}&start_index=${Number(startIndex) + limit}`}>
              <div><img alt="" src={`${staticRoot}img/icons/arrow_right_blu.png`} /></div>
            </a>
            <a href={`${pageLink}&start_index=${lastPage}`} className="lastpage pagelink">&#10219;&#10219;</a>
        </div>}
    </div>
   )
}
