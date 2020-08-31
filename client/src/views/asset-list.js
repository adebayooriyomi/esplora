import Snabbdom from 'snabbdom-pragma'
import { formatAssetAmount } from './util'
import layout from './layout'

const staticRoot = process.env.STATIC_ROOT || ''
export default ({ assetMap, goAssetList, totalAssets, currentPage, loading, assetIcons, t, ...S }) => {
  console.log(goAssetList)
  console.log(currentPage)
  const searchAsset = () => {
    if (typeof searchString !== 'string' || searchString.length === 0) { return assetMap }
    let searchLower = searchString.toLowerCase();
    let filtered = assetMap.filter(asset => {
        if (asset.name.toLowerCase().includes(searchLower)) { return true }
        if (asset.entity.domain.toLowerCase().includes(searchLower)) { return true }
        if (asset.ticker.toLowerCase().includes(searchLower)) { return true }
        return false;
    })
    return filtered;
  }

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

  let filteredAsset = searchAsset()
  const getSortDir = () => goAssetList.sortDir === 'asc' ? 'desc' : 'asc'

  // If user starts typing display FilteredAsset else display assetMap
  const assets = filteredAsset.length ? filteredAsset : assetMap

  return layout(
    <div>
      <div className="jumbotron jumbotron-fluid h-auto">
        <div className="container">
          <h1>{t`Registered assets`}</h1>
        </div>
      </div>
      <div className="container">
        { !assets.length ?  process.browser 
            ? <div className="load-more-container"><img src="img/Loading.gif" /></div>
            : <div className="load-more-container">
                <span className="asset-error">{t`Connection Error`}</span>
                <a className="load-more" href={`assets/registry?start_index=${goAssetList.startIndex == null ? 0 : goAssetList.startIndex}`}>
                  <span>{t`Reload`}</span>
                </a>
              </div>
          : <div className="assets-table">
              <div className="assets-table-row header">
                <a href={`/assets/registry?sort_field=name&sort_dir=${getSortDir()}`} className={`assets-table-cell sortable ${goAssetList.sortDir}`}>{t`Name`}</a>
                <a href={`/assets/registry?sort_field=ticker&sort_dir=${getSortDir()}`} className={`assets-table-cell ticker right-align sortable ${goAssetList.sortDir}`}>{t`Ticker`}</a>
                <div className="assets-table-cell right-align">{t`Total Supply`}</div>
                <a  href={`/assets/registry?sort_field=domain&sort_dir=${getSortDir()}`} className={`assets-table-cell right-align sortable ${goAssetList.sortDir}`}>{t`Issuer domain`}</a>
              </div>
              {assets.map(asset =>
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
                { loading
                  ? <div className="load-more disabled"><span>{t`Load more`}</span><div><img src="img/Loading.gif" /></div></div>
                  : paginationButtons(totalAssets, goAssetList) }
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
    const perPage = 10
    const maxVisibleButtons = 5

    let totalPage = Math.ceil(totalAssets / perPage)
    let buttonsArray = []

    const buttons =  {
      update(curPage){
        const { maxLeft, maxRight } = buttons.calculateMaxVisible(curPage)
        console.log(maxLeft, maxRight, curPage);
        for(let pageNum = maxLeft; pageNum <= maxRight; pageNum++){
          buttonsArray.push(pageNum)
        }
        return buttonsArray
      },

      calculateMaxVisible(curPage){
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
    }

    const { startIndex, sortDir, sortField, curPage } = goAssetList
    const lastPage = perPage * (totalPage - 1)
    return (
    <div className="pagination">
       {(Number(startIndex) - perPage) < 0 ? "" :
        <div className="prev-first control">
            <a href={`assets/registry?start_index=0&sort_field=${sortField}&sort_dir=${sortDir}&page=1`} className="firstpage pagelink">&#10218;&#10218;</a>
            <a className="pagelink" href={`assets/registry?start_index=${Number(startIndex) - perPage}&sort_field=${sortField}&sort_dir=${sortDir}&page=${Number(curPage) - 1}`}>
              <div><img alt="" src={`${staticRoot}img/icons/arrow_left_blu.png`} /></div>
            </a>
        </div>}
        <div className="numbers">
          {(buttons.update(Number(curPage))).map(pgNum => {
            const pageStartIndex = perPage * (pgNum - 1)
            
            let pageButton = <a href={`assets/registry?start_index=${pageStartIndex}&sort_field=${sortField}&sort_dir=${sortDir}&page=${pgNum}`} className="pagelink">{pgNum}</a>
            if (pageStartIndex === Number(startIndex)){
                pageButton = <a href={`assets/registry?start_index=${pageStartIndex}&sort_field=${sortField}&sort_dir=${sortDir}&page=${pgNum}`} className="pagelink current">{pgNum}</a>
            }
            return pageButton
          })}
        </div>
        {(Number(startIndex) + perPage) >= totalAssets ? "" :
        <div className="next-last control">
            <a className="pagelink" href={`assets/registry?start_index=${Number(startIndex) + perPage}&sort_field=${sortField}&sort_dir=${sortDir}&page=${Number(curPage) + 1}`}>
              <div><img alt="" src={`${staticRoot}img/icons/arrow_right_blu.png`} /></div>
            </a>
            <a href={`assets/registry?start_index=${lastPage}&sort_field=${sortField}&sort_dir=${sortDir}&page=${totalPage}`} className="lastpage pagelink">&#10219;&#10219;</a>
        </div>}
    </div>
   )
}


// const pagingNav = ({ goAssetList, assetMap, t }) => {
  
//   return(
//     process.browser

//     ?   moreAssetState && !moreAssetState.length ? "" 
//         : <div className="load-more" role="button" 
//                 data-currentSortDir={goAssetList.sortDir} 
//                 data-currentField={goAssetList.sortField} 
//                 data-loadmoreAssets={assetMap.length}>
//               <span>{t`Load more`}</span>
//               <div><img alt="" src={`${staticRoot}img/icons/arrow_down.png`} /></div>
//           </div>
//     : [
//           goAssetList.startIndex == null || goAssetList.startIndex - 10 < 0 ? "" :
//             <a className="load-more" href={`assets/registry?start_index=${goAssetList.startIndex - 10}`}>
//               <div><img alt="" src={`${staticRoot}img/icons/arrow_left_blu.png`} /></div>
//               <span>{t`Previous`}</span>
//             </a>
//         , goAssetList != null &&
//             <a className="load-more" href={`assets/registry?start_index=${goAssetList.startIndex + 10}`}>
//               <span>{t`Next`}</span>
//               <div><img alt="" src={`${staticRoot}img/icons/arrow_right_blu.png`} /></div>
//             </a>
//       ]
//   )
// }
