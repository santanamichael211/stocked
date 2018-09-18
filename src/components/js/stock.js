import React, { Component } from "react";
import "../css/stock.css";
import Chart from "chart.js";

class Stock extends Component {
  constructor() {
    super();
    this.state = {
      currentDisplay: "",
      chart: null
    };
  }

  //on component mount, call canvas update with daily option to provide current day data
  componentDidMount() {
    this.updateCanvas("daily");
  }

  //-------------------------------------------------------------------static function to provide random color
  static setColor() {
    const Colors = {
      SizzlingRed: "#FF3855",
      RedSalsa: "#FD3A4A",
      TartOrange: "#FB4D46",
      OrangeSoda: "#FA5B3D",
      BrightYellow: "#FFAA1D",
      YellowSunshine: "#FFF700",
      SlimyGreen: "#299617",
      GreenLizard: "#A7F432",
      DenimBlue: "#2243B6",
      BlueJeans: "#5DADEC",
      PlumpPurple: "#5946B2",
      PurplePlum: "#9C51B6",
      SweetBrown: "#A83731",
      BrownSugar: "#AF6E4D",
      EerieBlack: "#1B1B1B",
      BlackShadows: "#BFAFB2",
      FieryRose: "#FF5470",
      SizzlingSunrise: "#FFDB00",
      HeatWave: "#FF7A00",
      LemonGlacier: "#FDFF00",
      SpringFrost: "#87FF2A",
      AbsoluteZero: "#0048BA",
      WinterSky: "#FF007C",
      Frostbite: "#E936A7"
    };

    let result;
    let count = 0;
    for (let prop in Colors) if (Math.random() < 1 / ++count) result = prop;
    return Colors[result];
  }
  //-------------------------------------------------------------------static function to provide random color end

  //-------------------------------------------------------------------Start Canvas Update
  updateCanvas = span => {
    //function called with requested time span(dailiy,weekly,monthly,yearly)

    //set current display to given time span
    this.setState({ currentDisplay: span }, () => {
      //if a chart already exist destroy it. This is necessary
      //to prevent charts from being overlayed on top of each other
      if (this.state.chart != null) this.state.chart.destroy();

      //obtain canvas context
      let ctx = this.refs.canvas.getContext("2d");

      //grab data using loadData function depending on currentDisplay
      let dataObj = this.loadData();

      //set data and labels for chart from retrieved data
      let data = dataObj.data;
      let labels = dataObj.labels;

      //specifying chart settings below
      //-------------------------------------------------------------------chart settings start
      let bgColor = Stock.setColor();
      this.setState({
        chart: new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: this.props.symbol,
                backgroundColor: "transparent",
                borderColor: bgColor,
                borderWidth: 0.8,
                data: data
              }
            ]
          },
          options: {
            elements: {
              line: { tension: 0 },
              point: { radius: 0, hitRadius: 3, hoverRadius: 3 }
            },
            cubicInterpolationMode: "monotone",
            maintainAspectRatio: false,
            legend: {
              display: false
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    fontSize: 9,
                    maxTicksLimit: 20
                  }
                }
              ],
              xAxes: [
                {
                  ticks: {
                    fontSize: 9
                  }
                }
              ]
            }
          }
        })
      });
      //-------------------------------------------------------------------chart settings end
    });
  };
  //-------------------------------------------------------------------end Canvas Update

  //-------------------------------------------------------------------change points to weekly dataset
  setWeek = () => {
    this.updateCanvas("week");
  };
  //-------------------------------------------------------------------change points to daily dataset
  setDay = () => {
    this.updateCanvas("daily");
  };
  //-------------------------------------------------------------------change points to monthly dataset
  setMonth = () => {
    this.updateCanvas("month");
  };
  //-------------------------------------------------------------------change points to yearly dataset
  setYear = () => {
    this.updateCanvas("year");
  };

  //-------------------------------------------------------------------loadData function start
  loadData = () => {
    let data = [];
    let labels = [];

    //-------------------------------------------------------------------daily data points start
    if (this.state.currentDisplay === "daily") {
      //grab data from props
      let temp = this.props.data.intraday.data;

      //traverse data in reverse so that oldest point is to left of chart and most recent is to the right
      for (var i = temp.length - 1; i >= 0; i--) {
        //push data and labels for open, high, low, and close values
        data.push(temp[i]["1. open"]);
        labels.push(temp[i].name.split(" ")[1] + " open");
        data.push(temp[i]["2. high"]);
        labels.push(temp[i].name.split(" ")[1] + " high");
        data.push(temp[i]["3. low"]);
        labels.push(temp[i].name.split(" ")[1] + " low");
        data.push(temp[i]["4. close"]);
        labels.push(temp[i].name.split(" ")[1] + " close");
      }
    }
    //-------------------------------------------------------------------daily data points end

    //-------------------------------------------------------------------weekly data points start
    if (this.state.currentDisplay === "week") {
      //initialize array of days for labels
      let days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

      //grab intraday and weekly data and concatinate both into one array
      let intraday = this.props.data.intraday.data;
      let weekly = this.props.data.weekly.data;
      let total = intraday.concat(weekly);
      let reg = /(-)/gi;

      //traverse in reverse order for correct stock chart display
      for (var j = total.length - 1; j >= 0; j--) {
        //grab date and time string for labels
        let timeString = total[j].name.split(" ")[1];
        let dateString = total[j].name.split(" ")[0];
        let date = new Date(dateString.replace(reg, " "));
        let day = days[date.getDay()];

        //push data and labels to data and labels array
        data.push(total[j]["1. open"]);
        labels.push(day + timeString + " open");
        data.push(total[j]["2. high"]);
        labels.push(day + timeString + " high");
        data.push(total[j]["3. low"]);
        labels.push(day + timeString + " low");
        data.push(total[j]["4. close"]);
        labels.push(day + timeString + " close");
      }
    }
    //-------------------------------------------------------------------weekly data points end

    //-------------------------------------------------------------------Monthly data points start
    if (this.state.currentDisplay === "month") {
      //initialize array of months for labels
      let months = [
        "Jan.",
        "Feb.",
        "Mar.",
        "Apr.",
        "May",
        "Jun.",
        "Jul.",
        "Aug.",
        "Sep.",
        "Oct.",
        "Nov.",
        "Dec."
      ];

      //grab monthly data
      let total = this.props.data.monthly.data.slice();
      let reg = /(-)/gi;

      let dataPoints = 0;
      //if stock is older than a month set datapoints to 30 else set to number of available points
      if (this.props.data.monthly.data.length < 30)
        dataPoints = this.props.data.monthly.data.length;
      else {
        dataPoints = 30;
      }

      //monthly data array was already reversed when data recieved.
      //go to end of data which is most recent point, move back by dataPoints value and
      //traverse forward to display most recent value at right of chart
      for (var k = total.length - (1 + dataPoints); k < total.length; k++) {
        //grab date and time string for labels
        let dateString = total[k].name;
        let date = new Date(dateString.replace(reg, " "));
        let month = months[date.getMonth()];
        let day = date.getDate();

        //push data and labels to data and labels array
        data.push(total[k]["1. open"]);
        labels.push(month + " " + day + " open");
        data.push(total[k]["2. high"]);
        labels.push(month + " " + day + " high");
        data.push(total[k]["3. low"]);
        labels.push(month + " " + day + " low");
        data.push(total[k]["4. close"]);
        labels.push(month + " " + day + " close");
      }
    }

    //-------------------------------------------------------------------Monthly data points end

    //-------------------------------------------------------------------Yearly data points start
    if (this.state.currentDisplay === "year") {
      //obtain all monthly data which should be 251 data points or less
      let total = this.props.data.monthly.data.slice();
      let length = total.length;

      for (var l = 0; l < length; l++) {
        let dateString = total[l].name;

        //push data and labels to data and labels array
        data.push(total[l]["1. open"]);
        labels.push(dateString + " open");
        data.push(total[l]["2. high"]);
        labels.push(dateString + " high");
        data.push(total[l]["3. low"]);
        labels.push(dateString + " low");
        data.push(total[l]["4. close"]);
        labels.push(dateString + " close");
      }
    }
    //-------------------------------------------------------------------Yearly data points end

    //return object with data and labels
    return {
      data: data,
      labels: labels
    };
  };
  //-------------------------------------------------------------------loadData function end

  //-------------------------------------------------------------------rendering below
  render() {
    //initialize and declare variables needed
    let classes = "";
    let perChange = 0;
    let dailyVals = [];
    //check if there is available intraday data for this stock
    if (this.props.data.intraday.data[0]) {
      //calculate percent change using (new - old)/new * 100
      perChange =
        (parseFloat(this.props.data.intraday.data[0]["4. close"]) -
          parseFloat(this.props.data.weekly.data[0]["4. close"])) /
        parseFloat(this.props.data.weekly.data[0]["4. close"]);
      perChange *= 100;
      //obtain values for current open, high, low, and close
      dailyVals = [
        this.props.data.intraday.data[0]["1. open"],
        this.props.data.intraday.data[0]["2. high"],
        this.props.data.intraday.data[0]["3. low"],
        this.props.data.intraday.data[0]["4. close"],
        this.props.data.intraday.data[0]["5. volume"]
      ];
    }
    //if unavailable set to NA
    else {
      dailyVals = ["NA", "NA", "NA", "NA", "NA"];
    }

    //if percent change is positive color background of chart green else color it red
    if (perChange > 0) {
      classes += "green";
    } else {
      classes += "red";
    }

    //return for rendering
    return (
      <div className="stockEle">
        <div className="chart-container">
          <div className="info-div">
            <button className="switch-button" onClick={this.setYear}>
              1Y
            </button>
            <button className="switch-button" onClick={this.setMonth}>
              1M
            </button>
            <button className="switch-button" onClick={this.setWeek}>
              5D
            </button>
            <button className="switch-button" onClick={this.setDay}>
              1D
            </button>
            <button
              className="delete-button"
              onClick={this.props.delete.bind(this, this.props.data.symbol)}
            >
              &times;
            </button>
          </div>
          <canvas ref="canvas" id="stockChart" className={classes} />
        </div>
        <table>
          <tbody>
            <tr>
              <td className="top-row">
                <div className="tooltip">
                  <span className="tooltiptext">Symbol</span>
                  <i className="fas fa-money-check orange" />
                </div>
              </td>
              <td className="top-row">
                <div className="tooltip">
                  <span className="tooltiptext">Opening Value</span>
                  <i className="fas fa-door-open orange" />
                </div>
              </td>
              <td className="top-row">
                <div className="tooltip">
                  <span className="tooltiptext">Highest Value</span>
                  <i className="fas fa-long-arrow-alt-up up" />
                </div>
              </td>
              <td className="top-row">
                <div className="tooltip">
                  <span className="tooltiptext">Lowest Value</span>
                  <i className="fas fa-long-arrow-alt-down down" />
                </div>
              </td>
              <td className="top-row">
                <div className="tooltip">
                  <span className="tooltiptext">Closing Value</span>
                  <i className="fas fa-door-closed orange" />
                </div>
              </td>
              <td className="top-row">
                <div className="tooltip">
                  <span className="tooltiptext">Volume</span>
                  <i className="fas fa-archive orange" />
                </div>
              </td>
              <td className="top-row">
                <div className="tooltip">
                  <span className="tooltiptext">Percent Change</span>
                  <i className="fas fa-percent orange" />
                </div>
              </td>
            </tr>
            <tr>
              <td>{this.props.data.symbol}</td>
              <td>${dailyVals[0]}</td>
              <td>${dailyVals[1]}</td>
              <td>${dailyVals[2]}</td>
              <td>${dailyVals[3]}</td>
              <td>{dailyVals[4]}</td>
              <td className={classes}>%{perChange.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
        <h5 className="time">
          Date Displayed: {this.props.data.intraday.time}{" "}
        </h5>
      </div>
    );
  }
}

export default Stock;
