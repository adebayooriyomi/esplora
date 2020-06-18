import Snabbdom from 'snabbdom-pragma'
import menu from './navbar-menu'

export default S =>
  <nav className="navbar navbar-dark navbar-expand-lg">
    <div className="container">
      <a className="navbar-brand" href="."></a>
      <div className="nav" id="navbar-menu">
        { menu(S) }
      </div>
    </div>
  </nav>
