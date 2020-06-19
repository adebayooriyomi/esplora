import Snabbdom from 'snabbdom-pragma'
import navbar from './navbar'
import footer from './footer'
import navSecondary from "./navbar-secondary";

export default (body, opt) =>
  <div className="explorer-container">
    <div className="content-wrap">
      { navbar(opt) }
      {navSecondary(opt)}
      { body }
    </div>
    { footer(opt) }
  </div>
