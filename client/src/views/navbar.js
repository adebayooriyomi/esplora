import Snabbdom from 'snabbdom-pragma'
import menu from './navbar-menu'
import search from './search'

const isTouch = process.browser && "ontouchstart" in window;

export default ({t}) =>
  <nav className="navbar navbar-dark navbar-expand-lg">
    <div className="container">
      <div className="nav-container">
        <a className="navbar-brand" href="."></a>
        <div className="nav" id="navbar-menu">
          { menu({t}) }
        </div>
      </div>
      { search({ t, autofocus: !isTouch }) }
    </div>
  </nav>
