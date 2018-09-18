import React, { Component } from "react";
import StockList from "./components/js/stocklist";
import "./App.css";
import searchsvg from "./images/svgs/search.svg";
import moneysvg from "./images/svgs/money.svg";
import graphsvg from "./images/svgs/graph.svg";
import ReactSVG from "react-svg";
import { Link, Events, animateScroll as scroll, scrollSpy } from "react-scroll";

class App extends Component {
  componentDidMount() {
    Events.scrollEvent.register("begin", function(to, element) {});

    Events.scrollEvent.register("end", function(to, element) {});

    scrollSpy.update();
  }

  componentWillUnmount() {
    Events.scrollEvent.remove("begin");
    Events.scrollEvent.remove("end");
  }

  scrollTo() {
    scroll.scrollTo(100);
  }

  render() {
    return (
      <div className="App">
        <div id="wrapper">
          <div id="bg-div" />
          <div id="information-div">
            <span id="logo">
              <h2 className="dollar">$</h2>
              <h1>tocked</h1>
            </span>
            <header>
              <span className="information-span">
                <h2>Stocking Up</h2>
                <h1>Has just gotten easier!</h1>
                <p>
                  With the help of{" "}
                  <a
                    href="https://www.alphavantage.co"
                    className="alphavantage-link"
                  >
                    <h3 className="alpha">ALPHA</h3>{" "}
                    <h3 className="vantage">VANTAGE's</h3>
                  </a>{" "}
                  accurate intraday API, $tocked provides information for all of
                  your favorite stocks with a simple to use interface.
                </p>
              </span>
              <span className="information-span">
                <h4>Get Started Using $tocked</h4>
                <button id="go-to-btn">
                  <Link to="anchor" spy={true} smooth={true} duration={1100}>
                    <h5 id="arrow">&#42780;</h5>
                  </Link>
                </button>
              </span>
            </header>
          </div>
        </div>
        <div id="tutorial-div">
          <div id="tutorial-div-bg" />
          <div id="tutorial-div-content">
            <ul>
              <li>
                <span>
                  <ReactSVG
                    src={searchsvg}
                    svgStyle={{ width: 50, height: 50 }}
                  />
                </span>
                <h1>Search</h1>
                <p>
                  Easily search for any of your favorite stocks with a fast and
                  efficient system. Once you have found your desired stock,
                  simply click on the name to have its chart come up.
                </p>
              </li>
              <li>
                <span>
                  <ReactSVG
                    src={graphsvg}
                    svgStyle={{ width: 50, height: 50 }}
                  />
                </span>
                <h1>Analyze</h1>
                <p>
                  Once you have your desired stock displayed, use the
                  appropriate buttons to switch between intraday, weekly,
                  monthly, and yearly views. Stocks will also be displayed with
                  either a red or green background according to their
                  performance.
                </p>
              </li>
              <li>
                <span>
                  <ReactSVG
                    src={moneysvg}
                    svgStyle={{ width: 50, height: 50 }}
                  />
                </span>
                <h1>Invest</h1>
                <p>
                  Once you are ready to make a decision, you can begin to take
                  the appropriate steps to invest in the stock of your choice.
                </p>
              </li>
            </ul>
          </div>
        </div>
        <div id="anchor" />
        <StockList />
        <footer>
          <h1>
            <i className="fab fa-react" />
            Made With{" "}
            <a href="https://reactjs.org" className="react">
              React
            </a>
          </h1>{" "}
          &{" "}
          <a href="https://www.alphavantage.co" className="alphavantage-link">
            <h3 className="alpha">ALPHA</h3>{" "}
            <h3 className="vantage">VANTAGE</h3>
          </a>
          <p>
            Copyright &copy; 2018{" "}
            <a href="http://www.michaelsantana.me">Michael Santana</a>
          </p>
        </footer>
      </div>
    );
  }
}

export default App;
