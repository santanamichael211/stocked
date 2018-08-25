import React, { Component } from 'react';
import Stock from "./stock"
import axios from "axios";
import './stocklist.css';
import symbols from '../json/symbols.json';
import * as Scroll from 'react-scroll';
import {animateScroll as scroll, scrollSpy} from 'react-scroll'

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
    var stockName = document.getElementById("search").value;
    if(stockName==="" || stockName.length<3){
      this.setState({message:{
        type:"error",
        value:"Length of name must be greater than or equal to 3 characters"
      }})
       return;
    }

    var regFilter =  new RegExp('('+stockName+')',"gi");


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


document.getElementById("loader").style.display = "block";
//--- Api Fetch
  axios.get("https://www.alphavantage.co/query?apikey="+key+"&function=TIME_SERIES_INTRADAY&interval=5min&outputsize=full&symbol="+symbol.toUpperCase())
    .then((response) =>{

        if(response.data.Information){
          this.setState({message:{
            type:"message",
            value:"Unable to recieve data due to API limitations. Please wait a few minutes and try again."
          }})
          document.getElementById("loader").style.display = "none";
          return;
        }


        if(!response.data["Error Message"]){
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

                  var currentDate = new Date();
                  if(currentDate.getDay()==6) currentDate.setDate(currentDate.getDate()-1);
                  if(currentDate.getDay()==0) currentDate.setDate(currentDate.getDate()-2);
                  var month, date, year;
                  month = currentDate.getMonth() + 1;
                  date = currentDate.getDate();
                  year = currentDate.getFullYear();
                  if(month<10) month = "0"+month;
                  if(date<10) date = "0"+date;
                  var firstDate = year +"-"+month+"-"+date;
                  currentDate.setDate(currentDate.getDate()-1);

                  var timeLine = "";
                  for(var i = 0; i<4;i++){
                    if(currentDate.getDay()===0){currentDate.setDate(currentDate.getDate()-2);}
                    if(currentDate.getDay()===6){currentDate.setDate(currentDate.getDate()-1);}
                    month = currentDate.getMonth() + 1;
                    date = currentDate.getDate();
                    year = currentDate.getFullYear();
                    if(month<10) month = "0"+month;
                    if(date<10) date = "0"+date;
                    var formattedDate = year +"-"+month+"-"+date;
                    if(i===3){
                      timeLine+=formattedDate;
                    }
                    else{
                      timeLine+=formattedDate+"|";
                    }
                    currentDate.setDate(currentDate.getDate()-1);
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


                }
                document.getElementById("search").value = "";

        axios.get("https://www.alphavantage.co/query?apikey="+key+"&function=TIME_SERIES_DAILY&outputsize=full&symbol="+symbol.toUpperCase())
            .then(response=>{
              var monthlyDataArr = [];
              for(var i=251;i>=0;i--){
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


            })
            .catch((err)=>{
              console.log(err);
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
    });

  //---- end of api call

  }


  preventSubmit = (evt) =>{
    evt.preventDefault();
    this.searchStock();
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
        return(<div key={searchedEle.symbol} className="searchele-container" style={{borderTopColor:Stock.setColor()}}>
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
            <div className="form-div">
              <i className="fas fa-search"></i>
              <form onSubmit={this.preventSubmit}>
              <input id="search" type="text" placeholder="search for name of company..." name="stocks"required/>
              </form>
            </div>
            <div id="search-list">
              <h4 className={classes}>No Results Available</h4>
              {searchList}
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
