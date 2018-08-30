import React, { Component } from 'react';
import Stock from "./stock"
import axios from "axios";
import '../css/stocklist.css';
import symbols from '../../json/symbols.json';
import {animateScroll as scroll} from 'react-scroll';
import moment from "moment-timezone";


class StockList extends Component {

  constructor(){
    super();
    this.state = {
      stocklist: [],
      searchedItems:[],
      message:{
        type: "",
        value: ""
      }
    }

  }


//--- search company function
  searchStock = () =>{
    var stockName = document.getElementById("searchbar").value;
    if(stockName==="" || stockName.length<3){
      this.setState({message:{
        type:"error",
        value:"Length of name must be greater than or equal to 3 characters"
      }})
       return;
    }
    var regFilter =  new RegExp('^'+stockName+'.*$',"gi");

    var filtered = symbols.filter(function(element){
    return  regFilter.test(element.name);
    })

    this.setState({searchedItems:filtered});
  }

//---- Delete Item Function
  deleteItem = (symbol) =>{

    var stocklist = this.state.stocklist;
    var index = stocklist.findIndex((element)=>{
      return element.symbol === symbol;
    })

    stocklist.splice(index,1);

    this.setState({stocklist:stocklist,
      message:{
        type:"message",
        value:"Stock has been removed."
      }
    }) ;
  }


//---- call to api function
  callStock = (symbol) =>{

  let data = {};
  let key =  process.env.API_KEY;


//--- Api Fetch
  axios.get("https://www.alphavantage.co/query?apikey="+key+"&function=TIME_SERIES_INTRADAY&interval=5min&outputsize=full&symbol="+symbol.toUpperCase())
    .then((response) =>{

      document.getElementById("loader").style.display = "block";

      var currentDate = moment().tz("America/New_York");

      if((currentDate.day()!==6 || currentDate.day()!==0) && (currentDate.hour()<=9 && currentDate.minutes()<30)) currentDate.subtract(1,"day");

        if(response.data.Information){
          this.setState({message:{
            type:"message",
            value:"Unable to recieve data due to API limitations. Please wait a few minutes and try again."
          }})
          document.getElementById("loader").style.display = "none";
          return;
        }



        if(response && !response.data["Error Message"]){
                if(this.state.stocklist.find(e => e.symbol === response.data["Meta Data"]["2. Symbol"])){
                  this.setState({message:{
                    type:"message",
                    value:"This element is already being displayed."
                  }})
                  document.getElementById("loader").style.display = "none";
                  return;
                }
                else{
                  data = {
                    symbol:response.data["Meta Data"]["2. Symbol"],
                    intraday: {
                      time: response.data["Meta Data"]["3. Last Refreshed"],
                      data:[]
                    },
                    weekly:{
                      data:[]
                    }
                  };


                  if(currentDate.day()===6) currentDate.subtract(1,"day");
                  if(currentDate.day()===0) currentDate.subtract(2,"day");
                  var month, date, year;
                  month = currentDate.month() + 1;
                  date = currentDate.date();
                  year = currentDate.year();
                  if(month<10) month = "0"+month;
                  if(date<10) date = "0"+date;
                  var firstDate = year +"-"+month+"-"+date;
                  currentDate.subtract(1,"day");

                  var timeLine = "";
                  for(var i = 0; i<4;i++){
                    if(currentDate.day()===0){currentDate.subtract(2,"day");}
                    if(currentDate.day()===6){currentDate.subtract(1,"day");}
                    month = currentDate.month() + 1;
                    date = currentDate.date();
                    year = currentDate.year();
                    if(month<10) month = "0"+month;
                    if(date<10) date = "0"+date;
                    var formattedDate = year +"-"+month+"-"+date;
                    if(i===3){
                      timeLine+=formattedDate;
                    }
                    else{
                      timeLine+=formattedDate+"|";
                    }
                    currentDate.subtract(1,"day");
                  }

                  var regWeek = new RegExp("("+timeLine+")","i");
                  var regDay = new RegExp("("+firstDate+")","i");

                  Object.keys(response.data["Time Series (5min)"]).map((key)=>{
                      if(regDay.test(key)){
                        var curData = response.data["Time Series (5min)"][key];
                        curData.name = key;
                        data.intraday.data.push(curData)
                      }
                      else if(regWeek.test(key)){
                        var curData = response.data["Time Series (5min)"][key];
                        curData.name = key;
                        data.weekly.data.push(curData)
                      }
                  });

                  //--- daily data aquired
                }
                document.getElementById("search").value = "";

        axios.get("https://www.alphavantage.co/query?apikey="+key+"&function=TIME_SERIES_DAILY&outputsize=full&symbol="+symbol.toUpperCase())
            .then(response=>{

              var numPoints = 251;
              if(Object.keys(response.data["Time Series (Daily)"]).length<251) numPoints = Object.keys(response.data["Time Series (Daily)"]).length - 1;

              var monthlyDataArr = [];

              for(var i=numPoints;i>=0;i--){
                var curData = response.data["Time Series (Daily)"][Object.keys(response.data["Time Series (Daily)"])[i]];
                curData.name = Object.keys(response.data["Time Series (Daily)"])[i];
                monthlyDataArr.push(curData);
              }

              data.monthly = {};
              data.monthly.data = monthlyDataArr;
              var stocklist = this.state.stocklist;
              stocklist.push(data);
              this.setState({stocklist},()=>{
                document.getElementById("loader").style.display = "none";
              });

              //monthly and yearly data aquired

            })
            .catch((err)=>{
              console.log(err);
              this.setState({message:{
                type:"error",
                value:err.toString()
              }})
              document.getElementById("loader").style.display = "none";
              return;

            });

        }
        else{
          this.setState({message:{
            type:"error",
            value:"Unable to to retrieve data for specified company. Company may not be tracked by API."
          }})
          document.getElementById("loader").style.display = "none";
          return;
        }

    })
    .catch((err)=>{
      console.log(err);
      this.setState({message:{
        type:"error",
        value:err.toString()
      }})
      document.getElementById("loader").style.display = "none";
      return;
    });

  //---- end of api call



  }


  preventSubmit = (evt) =>{
    evt.preventDefault();
    this.searchStock();
    document.getElementById("searchbar").blur();
  }


  scrollMore = () => {
    scroll.scrollMore(400);
  }


  closeModal = () =>{
    this.setState({
      message:{
        type:"",
        value:""
      }
    })
  }



  render() {

    var modal = null;
    if(this.state.message.type ==="error"||this.state.message.type ==="message"){
      var modalColor = "";
      if(this.state.message.type ==="error") modalColor = "error-red";
      if(this.state.message.type ==="message") modalColor = "message-orange";
      modal = <div id="modal">
                <div id="modal-content" >
                  <h3 className={modalColor}>{this.state.message.type}<span onClick={this.closeModal}>&times;</span></h3>
                  <p>{this.state.message.value}</p>
                </div>
              </div>
    }


//--- create stock items
   let stockItems = [];
    if(this.state.stocklist){
    stockItems = this.state.stocklist.map(stockEle => {
      this.scrollMore();
        return(<Stock key={stockEle.symbol} data={stockEle} delete={this.deleteItem}/>)
      });
    }

      let classes = "";
//--- create searchlist items
    let searchList;
    if(this.state.searchedItems.length>0){
      classes = "hide";
      searchList = this.state.searchedItems.map(searchedEle => {
        return(<div key={searchedEle.symbol} className="searchele-container" style={{borderColor:Stock.setColor()}}>
          <h4 onClick={this.callStock.bind(this,searchedEle.symbol)}>{searchedEle.name}</h4>
        </div>)
      });
    }
    else{
      classes = "show";
    }

    return (
      <div id="stock-list">
        {modal}
            <div id="stock-list-wrapper">
              <div id="stock-list-bg"></div>
              <div id="form-div">
                <form onSubmit={this.preventSubmit}>
                <input id="searchbar" type="text" placeholder="search for name of company..." name="stocks"/>
                <div id="search-back"></div>
                </form>
              </div>
              <div id="search-list">
                <h4 className={"results-text "+classes}>No Results Available</h4>
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
