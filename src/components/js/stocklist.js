import React, { Component } from "react";
import Stock from "./stock";
import axios from "axios";
import "../css/stocklist.css";
import symbols from "../../json/symbols.json";
import { animateScroll as scroll } from "react-scroll";
import moment from "moment-timezone";

class StockList extends Component {
  constructor() {
    super();
    this.state = {
      stocklist: [],
      searchedItems: [],
      message: {
        type: "",
        value: ""
      }
    };
  }

  //-------------------------------------------------------------------search company function start
  searchStock = () => {
    // retrieve search bar input value
    let stockName = document.getElementById("searchbar").value;

    //test if empty or length to short to prevent large list of results
    if (stockName === "" || stockName.length < 3) {
      //display error
      this.setState({
        message: {
          type: "error",
          value: "Length of name must be greater than or equal to 3 characters"
        }
      });
      return;
    }

    //set regular expression for filtering elements by given stockname.
    //filter array in symbols.json to retrieve elements that pass regFilter test
    let regFilter = new RegExp("^" + stockName + ".*$", "gi");
    let filtered = symbols.filter(element => regFilter.test(element.name));
    this.setState({ searchedItems: filtered });
  };
  //-------------------------------------------------------------------search company function end

  //-------------------------------------------------------------------Delete Item Function
  deleteItem = symbol => {
    //create local copy of state.stocklist
    //obtain index from displayed stocklist of element that matches symbol value
    let stocklist = this.state.stocklist;
    let index = stocklist.findIndex(element => element.symbol === symbol);

    //remove stock at given index of local stocklist
    stocklist.splice(index, 1);

    //set state.stocklist to local stocklist and display message
    this.setState({
      stocklist: stocklist,
      message: {
        type: "message",
        value: "Stock has been removed."
      }
    });
  };
  //-------------------------------------------------------------------Delete Item Function end

  //-------------------------------------------------------------------call to api function start
  callStock = symbol => {
    let data = {};
    let key = process.env.API_KEY;

    //display loading sign
    document.getElementById("loader").style.display = "block";

    //make api fetch call using axios
    axios
      .get(
        "https://www.alphavantage.co/query?apikey=" +
          key +
          "&function=TIME_SERIES_INTRADAY&interval=5min&outputsize=full&symbol=" +
          symbol.toUpperCase()
      )
      .then(response => {
        //initialize currentdate to new york time zone to prevent issues with timezone differences
        let currentDate = moment().tz("America/New_York");

        //if current day is a weekday and it is earlier than 9:30am set currentDate to the previous day.
        //Because exchange opens at 9:30am this check is necessary when stock information for current day is not available
        if (
          (currentDate.day() !== 6 || currentDate.day() !== 0) &&
          (currentDate.hour() <= 9 && currentDate.minutes() < 30)
        )
          currentDate.subtract(1, "day");

        //if this statement registers true the API responded stating that call limit has been reached and time must be given before second call is made
        if (response.data.Information) {
          this.setState({
            message: {
              type: "message",
              value:
                "Unable to recieve data due to API limitations. Please wait a few minutes and try again."
            }
          });
          //remove loader
          document.getElementById("loader").style.display = "none";
          return;
        }

        if (response && !response.data["Error Message"]) {
          //verify requested company is not already displayed and provide error message if so
          if (
            this.state.stocklist.find(
              e => e.symbol === response.data["Meta Data"]["2. Symbol"]
            )
          ) {
            this.setState({
              message: {
                type: "message",
                value: "This element is already being displayed."
              }
            });
            // remove loader
            document.getElementById("loader").style.display = "none";
            return;
          } else {
            //create storage locations for intraday, weekly, and monthly data. data must be parsed before adding to object
            data = {
              symbol: response.data["Meta Data"]["2. Symbol"],
              intraday: {
                time: response.data["Meta Data"]["3. Last Refreshed"],
                data: []
              },
              weekly: {
                data: []
              },
              monthly: {
                data: []
              }
            };

            //modify currentDate so that it falls on day where data is available
            //if day is saturday(6) make day friday
            if (currentDate.day() === 6) currentDate.subtract(1, "day");
            //if day is sunday(0) make day friday
            if (currentDate.day() === 0) currentDate.subtract(2, "day");

            //initialize month date and year values. needed for parsing data
            let month, date, year;
            month = currentDate.month() + 1;
            date = currentDate.date();
            year = currentDate.year();
            //format and create date string for today in api date format
            if (month < 10) month = "0" + month;
            if (date < 10) date = "0" + date;
            let firstDate = year + "-" + month + "-" + date;
            //subtract day to set date to previous day for gathering previous 4 days
            currentDate.subtract(1, "day");

            //initialize variable to hold list of dates current day and previous 4 days
            let timeLine = "";

            //loop to set timeline value to last 4 days
            for (var i = 0; i < 4; i++) {
              //test if currentDate is day of weekend
              if (currentDate.day() === 0) {
                currentDate.subtract(2, "day");
              }
              if (currentDate.day() === 6) {
                currentDate.subtract(1, "day");
              }

              //format dates for past 4 days and append to time line string
              month = currentDate.month() + 1;
              date = currentDate.date();
              year = currentDate.year();
              if (month < 10) month = "0" + month;
              if (date < 10) date = "0" + date;

              let formattedDate = year + "-" + month + "-" + date;

              //if last value to be added, simply append other wise append with | symbol to use in regex as seperator
              if (i === 3) {
                timeLine += formattedDate;
              } else {
                timeLine += formattedDate + "|";
              }
              //move back one day for next iteration of loop
              currentDate.subtract(1, "day");
            }

            //create regExp for day and week strings
            const regWeek = new RegExp("(" + timeLine + ")", "i");
            const regDay = new RegExp("(" + firstDate + ")", "i");

            //loop through all elements of api data and push to our data object depending on date
            Object.keys(response.data["Time Series (5min)"]).forEach(key => {
              //if our current day string is equal to the key which in api data is the date, push curData object to intraday array
              if (regDay.test(key)) {
                let curData = response.data["Time Series (5min)"][key];
                curData.name = key;
                data.intraday.data.push(curData);
              }
              //if key string is in list of previous days, push curData object to weekly array
              else if (regWeek.test(key)) {
                let curData = response.data["Time Series (5min)"][key];
                curData.name = key;
                data.weekly.data.push(curData);
              }
            });
            console.log(data)

            //-------------------------------------------------------------------daily data parsed and aquired at this point
          }
          //call to other api endpoint to retrieve monthly and yearly data
          axios
            .get(
              "https://www.alphavantage.co/query?apikey=" +
                key +
                "&function=TIME_SERIES_DAILY&outputsize=full&symbol=" +
                symbol.toUpperCase()
            )
            .then(response => {
              //on average exchange is opened 251 days a year thus obtain 251 data points from provided api data
              let numPoints = 251;
              //if specified stock has not existed for this long, set number of data points to whatever is available
              if (
                Object.keys(response.data["Time Series (Daily)"]).length < 251
              )
                numPoints =
                  Object.keys(response.data["Time Series (Daily)"]).length - 1;

              let monthlyDataArr = [];

              //traverse the provided data in reverse so that it can later be easily displayed. First value in chart should be the oldest
              for (let i = numPoints; i >= 0; i--) {
                let curData =
                  response.data["Time Series (Daily)"][
                    Object.keys(response.data["Time Series (Daily)"])[i]
                  ];
                curData.name = Object.keys(
                  response.data["Time Series (Daily)"]
                )[i];
                monthlyDataArr.push(curData);
              }

              //set monthly data to retrieved data
              data.monthly.data = monthlyDataArr;

              //make local copy of stocklist, append data, and set state to local copy. callback and remove loader
              let stocklist = this.state.stocklist;
              stocklist.push(data);
              this.setState({ stocklist }, () => {
                document.getElementById("loader").style.display = "none";
              });

              //monthly and yearly data aquired at this point
            })
            .catch(err => {
              //display error and remove loader for second api call
              console.log(err);
              this.setState({
                message: {
                  type: "error",
                  value: err.toString()
                }
              });
              document.getElementById("loader").style.display = "none";
              return;
            });
        } else {
          //display error if api does not keep track of this company and remove loader
          this.setState({
            message: {
              type: "error",
              value:
                "Unable to to retrieve data for specified company. Company may not be tracked by API."
            }
          });
          document.getElementById("loader").style.display = "none";
          return;
        }
      })
      .catch(err => {
        //display error and remove loader for first api call
        console.log(err);
        this.setState({
          message: {
            type: "error",
            value: err.toString()
          }
        });
        document.getElementById("loader").style.display = "none";
        return;
      });
    //-------------------------------------------------------------------end of both api calls
  };
  //-------------------------------------------------------------------call to api function end

  //-------------------------------------------------------------------prevent submit of form and call stock search function
  preventSubmit = evt => {
    evt.preventDefault();
    this.searchStock();
    document.getElementById("searchbar").blur();
  };

  //-------------------------------------------------------------------function to scroll page when stock is added to list
  scrollMore = () => {
    scroll.scrollMore(400);
  };

  //-------------------------------------------------------------------function to close error/message modal by setting empty message state
  closeModal = () => {
    this.setState({
      message: {
        type: "",
        value: ""
      }
    });
  };

  //-------------------------------------------------------------------rendering below
  render() {
    //-------------------------------------------------------------------create modal start
    let modal = null;
    //test whether there is an available message/error to be displayed
    if (
      this.state.message.type === "error" ||
      this.state.message.type === "message"
    ) {
      //set color of modal to red if error or orange if message
      let modalColor = "";
      if (this.state.message.type === "error") modalColor = "error-red";
      if (this.state.message.type === "message") modalColor = "message-orange";
      //create modal with necessary information
      modal = (
        <div id="modal">
          <div id="modal-content">
            <h3 className={modalColor}>
              {this.state.message.type}
              <span onClick={this.closeModal}>&times;</span>
            </h3>
            <p>{this.state.message.value}</p>
          </div>
        </div>
      );
    }
    //-------------------------------------------------------------------create modal end

    //-------------------------------------------------------------------create stock items
    let stockItems = [];
    if (this.state.stocklist) {
      stockItems = this.state.stocklist.map(stockEle => {
        //scroll page when stock is added to list
        this.scrollMore();
        //return stock element with necessary parameters
        return (
          <Stock
            key={stockEle.symbol}
            data={stockEle}
            delete={this.deleteItem}
          />
        );
      });
    }
    //-------------------------------------------------------------------create stock items end

    //-------------------------------------------------------------------create searchlist items
    //initialize classes string for hiding and displaying empty search text
    let classes = "";
    let searchList;
    if (this.state.searchedItems.length > 0) {
      //if list has elements hide text
      classes = "hide";
      //create list of returned search results
      searchList = this.state.searchedItems.map(searchedEle => {
        return (
          <div
            key={searchedEle.symbol}
            className="searchele-container"
            style={{ borderColor: Stock.setColor() }}
          >
            <h4 onClick={this.callStock.bind(this, searchedEle.symbol)}>
              {searchedEle.name}
            </h4>
          </div>
        );
      });
    } else {
      //show empty search text
      classes = "show";
    }
    //-------------------------------------------------------------------create searchlist items end

    //return for rendering
    return (
      <div id="stock-list">
        {modal}
        <div id="stock-list-wrapper">
          <div id="stock-list-bg" />
          <div id="form-div">
            <form onSubmit={this.preventSubmit}>
              <input
                id="searchbar"
                type="text"
                placeholder="search for name of company..."
                name="stocks"
              />
              <div id="search-back" />
            </form>
          </div>
          <div id="search-list">
            <h4 className={"results-text " + classes}>No Results Available</h4>
            {searchList}
          </div>
        </div>
        <div id="stocklist-container">
          <h4 className="total">{this.state.stocklist.length}</h4>
          <h2 id="loader">$</h2>
          {stockItems}
        </div>
      </div>
    );
  }
}

export default StockList;
