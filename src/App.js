import React, { Component } from 'react';
import StockList from "./components/stocklist";
import './App.css';
import stockImg from "./images/stock.png";
import searchImg from "./images/search.png"
import * as Scroll from 'react-scroll';
import { Link, Events, animateScroll as scroll, scrollSpy} from 'react-scroll'


class App extends Component {

  componentDidMount(){
    Events.scrollEvent.register('begin', function(to, element) {
    });

    Events.scrollEvent.register('end', function(to, element) {
    });

    scrollSpy.update();
  }

  componentWillUnmount() {
   Events.scrollEvent.remove('begin');
   Events.scrollEvent.remove('end');
 }

 scrollTo() {
    scroll.scrollTo(100);
  }

  render() {
    return (
      <div className="App">
        <nav>
          <h2 className="dollar">$</h2><h1>tocked</h1>
        </nav>
        <div id="wrapper">
          <div id="information-div">
            <h1 id="header"><span>$</span>tocked</h1>
            <h4 className="header-text">Keep track of your favorite $tocks with ease...</h4>
            <p className="header-text">$tocked Runs on <a href="https://www.alphavantage.co" className="alphavantage-link"><h3 className="alpha">ALPHA</h3> <h3 className="vantage">VANTAGE's</h3></a> free API to provide you with current intraday stock information. View all of your favorite stocks with an easy to use interface.</p>
            <br/>
            <br/>
                <Link className="go-to-btn" to="anchor" spy={true} smooth={true} duration={1100}>
                  Start Using
                </Link>
          </div>
        </div>
        <div id="tutorial-div">
          <section>
            <span id="section-head"><h2>Using</h2><h1 className="dollar"> $</h1><h2>tocked</h2></span>
            <p>Using $tocked is very simple. Enter the name of a desired company to be presented with a list of options. Once you have decided the company for which you would like to view stock data, simply click on the name and a panel with its current information will be added. Use the buttons on top of the panel to switch between chart views.</p>
            <p>Stocks with current values lower than the previous closing date will be displayed with red backgrounds while those doing well will be displayed with green backgrounds. </p>
            <p>$tocked runs on <a href="https://www.alphavantage.co"><h3 className="alpha">ALPHA</h3> <h3 className="vantage">VANTAGE's</h3></a> free API. Due to limitations there may be a wait time after too many concurrent searches. </p>
          </section>
          <section class="aside">
            <img src={searchImg} alt="example search"></img>
            <img src={stockImg} alt="example stock"></img>
          </section>
      </div>
        <br/>
          <div id="anchor">
          </div>
        <StockList/>
        <footer>
          <h1><i className="fab fa-react"></i>Made With <a href="https://reactjs.org" className="react">React</a></h1> & <a href="https://www.alphavantage.co" className="alphavantage-link"><h3 className="alpha">ALPHA</h3> <h3 className="vantage">VANTAGE</h3></a>
        <p>Copyright &copy; 2018 <a href="http://www.michaelsantana.me">Michael Santana</a></p>
        </footer>
      </div>
    );
  }
}

export default App;
