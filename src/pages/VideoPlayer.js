import {useContext, useEffect, useState, useRef} from 'react';
import "../css/Video.css";

import aws from "../database/AWS"; 
import { getDynamoData } from "../database/Dynamo_Video";
import { updateDynamo } from "../database/Dynamo_Video";
import { updatePlaylist } from "../database/Dynamo_Video";
import { getDynamoUser } from "../database/Dynamo_Video"; 
//import tracking from "../ai/tracking"
import Webcam from 'react-webcam';

import {AccountContext} from "../database/AccContext_Session";
import {useHistory} from "react-router-dom";
import {UserTableContext} from "../database/Dynamo_UserTable";

import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import drawJoints from '../ai/draw'; 
const getS3url = aws.s3.getS3url; 


function setCommentInfo(videoID, category){
  getDynamoData(videoID, category).then((data) => {
    var f = data.Item.user_comments;
    var g = data.Item.user_comments.length;
    document.getElementById("comment-num1").innerHTML =  g;

    for (let i = 0; i < f.length; i++) {
      document.getElementById("user-comments").innerHTML = '<div class = "comment-block"> <div class ="comment-image"> <img class = "comment-image-' + i + '" id = "userimg" src={imageurl} alt="user image"></img> </div> <div class = "comment-text" id = "comment-text"> <div class = "comment-user" id = "comment-user-' + i + '"> </div> <div class = "comment-date" id = "comment-date-' + i + '"> </div> </div> <div class= "comment-message" id = "comment-message-' + i + '"> </div></div>' + document.getElementById("user-comments").innerHTML;
    }

    for (let i = 0; i < f.length; i++){
      const imageurl = getS3url(f[i].imageurl)
      
      document.getElementById("comment-date-"+i).innerHTML = f[i].date;
      document.getElementById("comment-message-"+i).innerHTML = f[i].message;
      document.getElementById("comment-user-"+i).innerHTML = f[i].username;
      document.getElementsByClassName("comment-image-"+i)[0].src = imageurl;

    }

  }
    )
}

var ucomm = 1;

function postComment(){

  var user_email = document.getElementById("user_email").innerHTML;

  if(user_email == 'none')
    document.getElementById("CommentButtonText").innerHTML = "You Must Log In"

  else{
    var videoID1 = document.getElementById("videoID").innerHTML;

    var videoCategory = videoID1.substring(videoID1.lastIndexOf('_')+1);
    var videoID1 = videoID1.substring(0, videoID1.lastIndexOf('_'));

    var inputVal = document.getElementById("user-comment").value;

    var user_email = document.getElementById("user_email").innerHTML;
    getDynamoUser(user_email).then((data) => {
      console.log(data.Item.user_name);
      console.log(data.Item.user_profile);

      var signedInUserName = data.Item.user_name;
      var signedInUserURL = data.Item.user_profile;

      updateDynamo(inputVal, signedInUserName, signedInUserURL, videoID1, videoCategory);

      getDynamoData(videoID1, videoCategory).then((data) => {
        document.getElementById("user-comments").innerHTML = '<div class = "comment-block"> <div class ="comment-image"> <img class = "comment-image-u-' + ucomm + '" id = "userimg" src={imageurl} alt="user image"></img> </div> <div class = "comment-text" id = "comment-text"> <div class = "comment-user" id = "comment-user-u-' + ucomm + '"> </div> <div class = "comment-date" id = "comment-date-u-' + ucomm + '"> </div> </div> <div class= "comment-message" id = "comment-message-u-' + ucomm + '"> </div></div>' + document.getElementById("user-comments").innerHTML;
    
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); 
        var yyyy = today.getFullYear();
        
        today = mm + '/' + dd + '/' + yyyy;
    
        var inputVal = document.getElementById("user-comment").value;
        document.getElementById("comment-user-u-"+ucomm).innerHTML = signedInUserName;
        document.getElementsByClassName("comment-image-u-"+ucomm)[0].src = getS3url(signedInUserURL);
        document.getElementById("comment-message-u-"+ucomm).innerHTML = inputVal;
        document.getElementById("comment-date-u-"+ucomm).innerHTML = today;
    
        ucomm++;
    
        var num = parseInt(document.getElementById("comment-num1").innerHTML)
        num++;
        document.getElementById("comment-num1").innerHTML = num;
    
      }
        )

    }
      )
  }
}

function updatePlaylistFunction(signedInUserEmail){
  var user_email = document.getElementById("user_email").innerHTML;

  if(user_email == 'none')
    document.getElementById("add-playlist-text").innerHTML = "You Must Log In"
  else{
  var videoID1 = document.getElementById("videoID").innerHTML;
  var videoCategory = videoID1.substring(videoID1.lastIndexOf('_')+1);
  var videoID1 = videoID1.substring(0, videoID1.lastIndexOf('_'));
  console.log(user_email)
  document.getElementById("add-playlist-text").innerHTML = "Adding Video..."

  updatePlaylist(user_email, videoID1, videoCategory)
  document.getElementById("add-playlist-text").innerHTML = "Video Added!"
  }
}


function CommentSection() {
  // TODO: Add current user info. 
  const {getSession} = useContext(AccountContext);

  return (
    <>
      <div id= "line"></div>
      <div class = "video-comments">
        <div class = "comments-header">
          <div class = "comment-num" id = "comment-num">Comments (</div><div class = "comment-num1" id = "comment-num1"></div><div class = "comment-num">)</div>
          <div class = "signedInUser"></div>
          <div class = "comment-form">
            <form id = "submit-comment">
              <input type="text" id="user-comment" name="user-comment" placeholder = "Add a comment..."></input>
            </form>
          </div>
          <button id = "comment-button" value="COMMENT" onClick = {() => {postComment()}}><p class = "CommentButtonText" id = "CommentButtonText">COMMENT</p></button>
        </div>
      <div class = "user-comments" id = "user-comments"></div>
    </div>
    </>
  );
}

function VideoInformationSection(props) {
  const videoTitle = props.videoTitle; 
  const datePublished = props.datePublished;
  const category = props.category;
  const profilePicID = props.profilePicID
  const creatorName = props.creatorName; 
  const description = props.description; 
  return (
    <>
      <div class = "video-header">
        <div id = "video-title" class = "video-title">{videoTitle}</div>
        <div class = "video-date" id = "video-date">{datePublished}</div>
        <div class = "video-category" id = "video-category">{category}</div>
      </div>
      <div id = "line"></div>
      <div class = "video-info">
        <div class="user-image">
            <img class = "user-i" id = "userimg" 
              src={profilePicID === "" ? "" : getS3url(profilePicID)} alt={creatorName}
            />
        </div>
        <div class="info-block">
          <div class = "user-name" id = "creator-name">{creatorName}</div>
          <div class = "video-description" id = "video-description">{description}</div>
        </div>
      </div>
    </>
  ); 
}

function VideoPlayer() { 
  const videoID = window.location.href.split('/').pop(); 
  const [videoCategory, setCategory] = useState(""); 
  const [videoTitle, setVideoTitle] = useState(""); 
  const [creatorName, setCreatorName] = useState(""); 
  const [datePublished, setDatePublished] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [comments, setComments] = useState([]); 
  const [creatorProfilePicID, setCreatorProfilePicID] = useState(""); 
  const flick = false; 

  useEffect(() => {

      getDynamoData(videoID, "default").then((data) => {
        console.log(data); 
        if (data) {
          setVideoTitle(data.Item.video_title);
          setCreatorName(data.Item.creator_name);
          setDatePublished(data.Item.date_of_publish);
          setDescription(data.Item.description);
          setCategory(data.Item.category.replaceAll("%20", " "));
          setComments(data.Item.user_comments);
          setCreatorProfilePicID(data.Item.creator_profile_pic);
        } else {
          console.log("here")
        }
      });   
  }, [flick, videoID]); 

  return (
          <>
            <div class = "video-page">
            <div class = "video-player">
                <video controls id = "video">
                  <source src={getS3url(videoID)} type="video/mp4" />
                </video>               
            </div>
            <div class="videio-metadata">
              <VideoInformationSection 
                videoTitle={videoTitle} 
                datePublished={datePublished}
                category={videoCategory}
                profilePicID={creatorProfilePicID}
                creatorName={creatorName}
                description={description}
              />
              <CommentSection />
              <div class = "videoID" id="videoID"></div>
              <div class = "user_email" id="user_email">none</div>
            </div>
            </div>
          </>
            
  );
}

export default VideoPlayer;