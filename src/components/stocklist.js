import React, { Component } from 'react';
import Stock from "./stock"
import axios from "axios";
import './stocklist.css';
import symbols from '../json/symbols.json';
import myKeys from '../json/myKeys.json';
import * as Scroll from 'react-scroll';
import {animateScroll as scroll, scrollSpy} from 'react-scroll'

class StockList extends Component {

  constructor(){
    super();
    this.state = {
      stocklist: [],
      lateststock :{},
      searchedItems:[]
    }

  }

//--- search company function
  searchStock = () =>{
    var stockName = document.getElementById("search").value;
    if(stockName==="") return;

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

    this.setState({stocklist});
  }


//---- call to api function
  callStock = (symbol) =>{

  let data = {};
  let key = myKeys.key;

//--- Api Fetch
  axios.get("https://www.alphavantage.co/query?apikey="+key+"&function=TIME_SERIES_DAILY_ADJUSTED&symbol="+symbol.toUpperCase())
    .then((response) =>{

        if(!response.data["Error Message"]){
                if(this.state.stocklist.find(e => e.symbol === response.data["Meta Data"]["2. Symbol"])){
                  alert("This item is already being displayed");
                }
                else{
                  data = {
                    symbol:response.data["Meta Data"]["2. Symbol"],
                    time: response.data["Meta Data"]["3. Last Refreshed"],
                    data:[
                    ]
                  };


                  var numPoints = 0;
                  if(Object.keys(response.data["Time Series (Daily)"]).length<30) numPoints = Object.keys(response.data["Time Series (Daily)"]).length;
                  else numPoints = 30;

                  for(var i = 0; i<numPoints; i++){
                    var dayData ={
                    open: response.data["Time Series (Daily)"][Object.keys(response.data["Time Series (Daily)"])[i]]["1. open"],
                    high:response.data["Time Series (Daily)"][Object.keys(response.data["Time Series (Daily)"])[i]]["2. high"],
                    low: response.data["Time Series (Daily)"][Object.keys(response.data["Time Series (Daily)"])[i]]["3. low"],
                    close: response.data["Time Series (Daily)"][Object.keys(response.data["Time Series (Daily)"])[i]]["4. close"],
                    }

                    data.data.push(dayData);
                  }

                  this.state.stocklist.push(data);
                  this.setState({lateststock:data});

                }
                document.getElementById("search").value = "";
        }
        else{
          alert("Unable to find stock.");
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



  render() {


//--- create stock items
    let stockItems;
    if(this.state.stocklist){
    stockItems = this.state.stocklist.map(stockEle => {
      this.scrollMore();
        return(<Stock key={stockEle.symbol} symbol={stockEle.symbol} data={stockEle.data} open={stockEle.data[0].open} high={stockEle.data[0].high} low={stockEle.data[0].low} close={stockEle.data[0].close} time={stockEle.time} delete={this.deleteItem}/>)
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
              <h4 className="total">{stockItems.length}</h4>
              {stockItems}
            </div>
      </div>
    );
  }
}

export default StockList;
