import "../css/Search.css";
import React, {useState, useEffect} from "react";
//import {Link} from 'react-router-dom';
import aws from "../database/AWS"; 
//import {UserTableContext} from "../database/Dynamo_UserTable";
import SearchResult from "../components/SearchResult";

import {scanTable} from "../database/Dynamo_Video"; 

function VideoCards(props) {
  const data = props.data; 
  const idx = props.idx; 
  return (

    <div className="video_card" style={{padding:"2em"}}>
      <br/>
      <a href={"/video/" + data.Items[idx].video_id}>
        <img src={aws.s3.getS3url(data.Items[idx].thumbnail_id)} alt={data.Items[idx].video_title} style={{width: "20em"}}/>
        {data.Items[props.idx].video_title}
      </a>
      <br/>
    </div>
  ); 
}


function Search() {

  const [arrOfVideoCards, setArrOfVideoCards] = useState([]); 

  useEffect(() => {

    scanTable().then((data) => {
      const arr = []
      for(let i = 0; i < data.Items.length; i++) {
        arr.push((<VideoCards data={data} idx={i}/>)); 
      }
      setArrOfVideoCards(arr); 
    }); 

  }); 

  return (
    <div className="search">
        <h1>Search page</h1>
        <SearchResult />        
        <br />
        <div id = "videos">
          {arrOfVideoCards}
        </div>
    </div>
    );
  }
  
  export default Search;

/*
  return (
    <div className="search">
        <h1>Search page</h1>
        <SearchResult />        
        <Link to={'/play_video'}>First video; Yoga Demo</Link>
        <br />
        <div id = "videos">
          {arrOfVideoCards}
        </div>
    </div>
    );
  }
*/