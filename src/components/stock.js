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
    this.updateCanvas("daily");
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

      if(this.state.chart!=null)this.state.chart.destroy();

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
                backgroundColor: "transparent",
                borderColor: bgColor,
                borderWidth:.8,
                data: data,
              }]
            },
            options:{

              elements: {
                line:{tension:0},
                point: { radius:0,hitRadius: 3, hoverRadius: 3 }
              },
              cubicInterpolationMode:"monotone",
              maintainAspectRatio: false,
              legend: {
                display:false
              },
              scales:{
                yAxes:[{
                  ticks:{
                    fontSize:9,
                maxTicksLimit: 20
                  }
                }],
                xAxes:[{
                  ticks:{
                    fontSize:9
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
this.updateCanvas("week");
}



//-------------- change points to daily dataset
setDay = () =>{
  this.updateCanvas("daily");
}

//-------------- change points to monthly dataset
setMonth = () =>{
  this.updateCanvas("month");

}

setYear = () =>{
  this.updateCanvas("year");

}



loadData = () =>{

  var data = [];
  var labels = [];

  //----- daily data points start
  if(this.state.currentDisplay === "daily"){
   var temp = this.props.data.intraday.data;
    for(var i = temp.length -1; i>=0;i--){
      data.push(temp[i]["1. open"]);
      labels.push(temp[i].name.split(" ")[1]+ " open");
      data.push(temp[i]["2. high"]);
      labels.push(temp[i].name.split(" ")[1]+ " high");
      data.push(temp[i]["3. low"]);
      labels.push(temp[i].name.split(" ")[1]+ " low");
      data.push(temp[i]["4. close"]);
      labels.push(temp[i].name.split(" ")[1]+ " close");

    }
  }
  //----- daily data points end

  //----- weeky data points start
  if(this.state.currentDisplay === "week") {
    var days = ["Sun","Mon","Tues","Wed","Thurs","Fri","Sat"];

    var intraday =  this.props.data.intraday.data.slice().reverse();
    var weekly = this.props.data.weekly.data;
    var total = intraday.concat(weekly);
    var reg = /(-)/gi;

    for(var j = total.length-1; j>=0;j--){
      var timeString = total[j].name.split(" ")[1];
      var dateString = total[j].name.split(" ")[0];
      var date = new Date(dateString.replace(reg," "));
      var day = days[date.getDay()];

      data.push(total[j]["1. open"]);
      labels.push(day+timeString+" open");
      data.push(total[j]["2. high"]);
      labels.push(day+timeString+" high")
      data.push(total[j]["3. low"]);
      labels.push(day+timeString+" low")
      data.push(total[j]["4. close"]);
      labels.push(day+timeString+" close")
    }

  }
  //----- weeky data points end

  //----- Monthly data points start
  if(this.state.currentDisplay === "month"){
    var months = ["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."];

    var total = this.props.data.monthly.data.slice()
    var reg = /(-)/gi;



    var dataPoints = 0;
    if(this.props.data.monthly.data.length<30) dataPoints = this.props.data.monthly.data.length;
    else{dataPoints=30;}

    for(var k = total.length-(1+dataPoints); k<total.length;k++){
      var dateString = total[k].name;
      var date = new Date(dateString.replace(reg," "));
      var month = months[date.getMonth()];
      var day = date.getDate()

      data.push(total[k]["1. open"]);
      labels.push(month+" "+day+" open");
      data.push(total[k]["2. high"]);
      labels.push(month+" "+day+" high");
      data.push(total[k]["3. low"]);
      labels.push(month+" "+day+" low");
      data.push(total[k]["4. close"]);
      labels.push(month+" "+day+" close");
    }

  }

    //----- Monthly data points end

    //------ Yearly data points start
  if(this.state.currentDisplay === "year"){
    var months = ["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."];

    var total = this.props.data.monthly.data.slice();

    for(var l = 0; l<total.length;l++){
      var dateString = total[l].name;

      data.push(total[l]["1. open"]);
      labels.push(dateString+" open");
      data.push(total[l]["2. high"]);
      labels.push(dateString+" high");
      data.push(total[l]["3. low"]);
      labels.push(dateString+" low");
      data.push(total[l]["4. close"]);
      labels.push(dateString+" close");
    }

  }
  //------ Yearly data points end

  return {
    data:data,
    labels:labels
  }


}




//<button className="delete-button" onClick={this.props.delete.bind(this,this.props.symbol)}>&times;</button>

//-- rendering below

  render() {


    var classes = "";
    var perChange = (parseFloat(this.props.data.intraday.data[0]["4. close"]) - parseFloat(this.props.data.weekly.data[0]["4. close"]))/parseFloat(this.props.data.weekly.data[0]["4. close"]);
    perChange *= 100;
   if(perChange>0){ classes += "green"; }
   else {classes+= "red";}

    return (
      <div className="stockEle">
        <div className="chart-container">
        <div className="info-div">
          <button className="switch-button" onClick={this.setYear}>1Y</button>
          <button className="switch-button" onClick={this.setMonth}>1M</button>
          <button className="switch-button" onClick={this.setWeek}>5D</button>
          <button className="switch-button" active onClick={this.setDay}>1D</button>
          <button className="delete-button" onClick={this.props.delete.bind(this,this.props.data.symbol)}>&times;</button>
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
            <td className="top-row"><div className="tooltip"><span className="tooltiptext">Volume</span><i className="fas fa-archive orange"></i></div></td>
            <td className="top-row"><div className="tooltip"><span className="tooltiptext">Percent Change</span><i className="fas fa-percent orange"></i></div></td>
            </tr>
            <tr>
              <td>{this.props.data.symbol}</td>
              <td>{this.props.data.intraday.data[0]["1. open"]}</td>
              <td>{this.props.data.intraday.data[0]["2. high"]}</td>
              <td>{this.props.data.intraday.data[0]["3. low"]}</td>
              <td>{this.props.data.intraday.data[0]["4. close"]}</td>
              <td>{this.props.data.intraday.data[0]["5. volume"]}</td>
              <td className={classes}>%{perChange.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
        <h5 className="time">Date Displayed: {this.props.data.intraday.data[0].name} </h5>
      </div>
    );
  }

}

export default Stock;
