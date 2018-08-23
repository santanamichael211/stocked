import React, { Component } from 'react';
import './stock.css';
import Chart from "chart.js"

class Stock extends Component {

  constructor(){
    super();
      this.state = {
        currentDisplay: "",
        chart: null
      }

  }

  componentDidMount(){
    var ctx = this.refs.canvas.getContext("2d");
      this.setState({chart:new Chart(ctx)},()=>{
              this.updateCanvas("daily");
          })

  }

static setColor(){
var Colors = {
  SizzlingRed: "#FF3855",
  RedSalsa:	"#FD3A4A",
  TartOrange:	"#FB4D46",
  OrangeSoda:	"#FA5B3D",
  BrightYellow:	"#FFAA1D",
  YellowSunshine:	"#FFF700",
  SlimyGreen:"#299617",
  GreenLizard:	"#A7F432",
  DenimBlue:	"#2243B6",
  BlueJeans:	"#5DADEC",
  PlumpPurple:	"#5946B2",
  PurplePlum:	"#9C51B6",
  SweetBrown:	"#A83731",
  BrownSugar:	"#AF6E4D",
  EerieBlack:	"#1B1B1B",
  BlackShadows:	"#BFAFB2",
  FieryRose:	"#FF5470",
  SizzlingSunrise:	"#FFDB00",
  HeatWave:	"#FF7A00",
  LemonGlacier:	"#FDFF00",
  SpringFrost:	"#87FF2A",
  AbsoluteZero:	"#0048BA",
  WinterSky:	"#FF007C",
  Frostbite:	"#E936A7"
};

    var result;
    var count = 0;
        for (var prop in Colors)
            if (Math.random() < 1/++count)
               result = prop;
        return Colors[result];
  }

//------------------- Start Canvas Update

  updateCanvas = (span) =>{

    this.setState({currentDisplay:span},() => {

      this.state.chart.destroy();

      var ctx = this.refs.canvas.getContext("2d");

      var dataObj = this.loadData();

      var data = dataObj.data;
      var labels = dataObj.labels;

      //--- chart settings start
      var bgColor = Stock.setColor();
      this.setState({chart: new Chart(ctx, {
            type:"line",
            data:{
              labels:labels,
              datasets:[{
                label: this.props.symbol,
                backgroundColor: bgColor,
                borderColor: "whitesmoke",
                data: data,
              }]
            },
            options:{
              cubicInterpolationMode:"monotone",
              maintainAspectRatio: false,
              legend: {
                display:false
              },
              scales:{
                yAxes:[{
                  ticks:{
                maxTicksLimit: 20
                  }
                }]
              }
            }
          })})
          //--- chart settings end
    })
  }
//------------------- end Canvas Update

//-------------- change points to weekly dataset

setWeek = () =>{
  this.setState({currentDisplay:"week"}, () =>{
    this.updateCanvas("week");
  })

}



//-------------- change points to daily dataset
setDay = () =>{
  this.setState({currentDisplay:"daily"}, () =>{
    this.updateCanvas("daily");
  })

}

//-------------- change points to monthly dataset
setMonth = () =>{
  this.setState({currentDisplay:"month"}, () =>{
    this.updateCanvas("month");
  })

}



loadData = () =>{

  var data = [];
  var labels = [];

  //----- daily data points start
  if(this.state.currentDisplay === "daily"){
    data = [this.props.data[0].open,this.props.data[0].high,this.props.data[0].low,this.props.data[0].close];
    labels = ["Open","High", "Low","Close"];
  }
  //----- daily data points end

  //----- weeky data points start
  if(this.state.currentDisplay === "week") {
    var days = ["","Mon","Tues","Wed","Thurs","Fri"];
    var today = new Date().getDay();
    if(today=== 6 || today=== 0) today = 5;

    for(var i = 4; i>=0; i--){
      today++;
      if(today>=6) today = 1;
      data.push(this.props.data[i].open);
      labels.push(days[today] +" open");
      data.push(this.props.data[i].high);
      labels.push(days[today]);
      data.push(this.props.data[i].low);
      labels.push(days[today]);
      data.push(this.props.data[i].close);
      labels.push(days[today] +" close");

    }
  }
  //----- weeky data points end

  //----- Monthly data points start
  if(this.state.currentDisplay === "month"){
    var months = ["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."];
    var startDay = new Date();
    startDay.setDate(startDay.getDate());

    var dataPoints = 0;
    if(this.props.data.length<30) dataPoints = this.props.data.length;
    else{dataPoints=30;}

    for(var j = dataPoints - 1; j>=0; j--){
      if(startDay.getDay() === 0) startDay.setDate(startDay.getDate() - 2);
      if(startDay.getDay() === 6) startDay.setDate(startDay.getDate() - 1);
      data.push(this.props.data[j].open);
      labels.push(months[startDay.getMonth()] + " " + startDay.getDate() +" open");
      data.push(this.props.data[j].high);
      labels.push(months[startDay.getMonth()] + " " + startDay.getDate());
      data.push(this.props.data[j].low);
      labels.push(months[startDay.getMonth()] + " " + startDay.getDate());
      data.push(this.props.data[j].close);
      labels.push(months[startDay.getMonth()] + " " + startDay.getDate() +" close");
      startDay.setDate(startDay.getDate() - 1);
    }
    labels = labels.reverse();
  }

  //----- Monthly data points end

  return {
    data:data,
    labels:labels
  }


}






//-- rendering below

  render() {

    var classes = "";
    var perChange = ((parseFloat(this.props.close) - parseFloat(this.props.open))/parseFloat(this.props.open)) * 100;
    if(this.props.open<this.props.close){ classes += "green"; }
    else {classes+= "red";}

    return (
      <div className="stockEle">
        <div className="chart-container">
        <div className="info-div">
          <button className="switch-button" onClick={this.setMonth}>M</button>
          <button className="switch-button" onClick={this.setWeek}>W</button>
          <button className="switch-button" onClick={this.setDay}>D</button>
          <button className="delete-button" onClick={this.props.delete.bind(this,this.props.symbol)}>X</button>
        </div>
        <canvas ref="canvas" id="stockChart" className={classes}></canvas>
        </div>
        <table>
          <tbody>
            <tr>
            <td className="top-row"><div className="tooltip"><span className="tooltiptext">Symbol</span><i className="fas fa-money-check orange"></i></div></td>
            <td className="top-row"><div className="tooltip"><span className="tooltiptext">Opening Value</span><i className="fas fa-door-open orange"></i></div></td>
            <td className="top-row"><div className="tooltip"><span className="tooltiptext">Highest Value</span><i className="fas fa-long-arrow-alt-up up"></i></div></td>
            <td className="top-row"><div className="tooltip"><span className="tooltiptext">Lowest Value</span><i className="fas fa-long-arrow-alt-down down"></i></div></td>
            <td className="top-row"><div className="tooltip"><span className="tooltiptext">Closing Value</span><i className="fas fa-door-closed orange"></i></div></td>
            <td className="top-row"><div className="tooltip"><span className="tooltiptext">Percent Change</span><i className="fas fa-percent orange"></i></div></td>
            </tr>
            <tr>
              <td>{this.props.symbol}</td>
              <td>${parseFloat(this.props.open)}</td>
              <td>${parseFloat(this.props.high)}</td>
              <td>${parseFloat(this.props.low)}</td>
              <td>${parseFloat(this.props.close)}</td>
              <td className={classes}>{perChange.toFixed(3)}%</td>
            </tr>
          </tbody>
        </table>
        <h5 className="time">Date Displayed: {this.props.time} </h5>
      </div>
    );
  }

}

export default Stock;
