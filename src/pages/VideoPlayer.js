import React, {useContext, useEffect, useState} from 'react';
import "../css/Video.css";

import aws from "../database/AWS"; 
import { getDynamoData } from "../database/Dynamo_Video";
import { updateDynamo } from "../database/Dynamo_Video";

import {AccountContext} from "../database/AccContext_Session";
import {UserTableContext} from "../database/Dynamo_UserTable";
const getS3url = aws.s3.getS3url; 



function Comment(props) {
  return (
    <>
    <div id={props.commentCount}>
      <img 
        src={getS3url(props.contents.imageurl)} 
        alt={props.contents.username}
        style={{
          height:"3em",
          width: "3em", 
          borderRadius:'10em',
          marginTop: '1em',
          marginLeft: '2em',
          marginRight: '10em'
        }}
      />
      <p>{props.contents.username}</p>
      <p>{props.contents.date}</p>
      <p>{props.contents.message}</p>
    </div>
    </>
  ); 
}


function CommentSection(props) {
  const {getSession} = useContext(AccountContext);
  const {retrieveUser} = useContext(UserTableContext); 
  const [comments, setComments] = useState(props.comments);

  const [currentUserInfo, setCurrentUser] = useState(null);  
  let commentCounter = 0;

  function postComment(userInfo, comments, videoID, videoCategory){

    if (userInfo == null) {
      document.getElementById("CommentButtonText").innerHTML = "You Must Log In"
    } else {
  
      var comment = document.getElementById("user-comment").value;
      console.log(userInfo); 
      console.log(videoID);
  
      var signedInUserName = userInfo.user_name;
      var signedInUserURL = userInfo.user_profile;

  
      updateDynamo(comment, signedInUserName, signedInUserURL, videoID, videoCategory);
      comments.push({ 
        message: comment, 
        username: signedInUserName, 
        imageurl: signedInUserURL 
      });

      setComments([...comments]); 
      
    }
  }

  useEffect(() => {
    async function fetchCurrentUser() {
      let user = await getSession(); 
      let userInfo = await retrieveUser(user.email); 
      setCurrentUser(userInfo.Item); 
      console.log(props.videoCategory); 
    }

    fetchCurrentUser(); 
  }, [])

  return (
    <>
      <div id= "line"></div>
      <div class = "video-comments" style={{
        display: 'flex',
        flexDirection: 'column',
        height:'20em'
      }}>
        <div class = "comments-header"
          style={{
            display: 'flex',
            justifyContent: 'left' 
          }}
        >
          <img 
            src={currentUserInfo === null ? getS3url("guest.png") : getS3url(currentUserInfo.user_profile)}
            alt="current_user"
            style={{
              height:"3em",
              width: "3em", 
              borderRadius:'10em',
              marginTop: '1em',
              marginLeft: '2em',
              marginRight: '10em'
            }}
          />
          <h5 style={{
            marginRight: '1em', 
            marginLeft: "20em"
          }}
          >Comments
          </h5>
          
        
        </div>
          <div 
            class = "comment-form"
            style={{
              marginTop: '10px'
            }}
          >
            <form id = "submit-comment" style={{
              display: 'flex',
            }}>
              <input 
                type ="text" 
                id ="user-comment" 
                name ="user-comment" 
                placeholder = "Add a comment..." 
                style={{
                  height: "3em", 
                  width: "150em"
                }}
              />
            </form>
            <button 
                id = "comment-button" 
                value ="COMMENT" 
                style={{
                  borderRadius: ".2em", 
                  marginTop: ".01em"
                }}
                onClick = {() => {
                  postComment(currentUserInfo, props.comments, props.videoId, props.videoCategor); 
                }}> Submit </button>
          </div>
        </div>
      <div class = "user-comments" id = "user-comments">
        {
          props.comments.map((commentContents) => {
            return (
              <Comment contents={commentContents} commentCount={commentCounter++}/>
            )
          })
        }
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
              style={{
                height:"5em",
                width: "5em", 
                borderRadius:'10em'
              }}
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

  useEffect(() => {

    async function fetchVideoData() {
      await getDynamoData(videoID, "default").then((data) => {
        if (data.Item) {
          console.log(data); 
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
    }
    
    fetchVideoData()
  }, []); 

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
              <CommentSection
                comments={comments}
                videoId={videoID}
                videoCategory={videoCategory}
              />
              <div class = "videoID" id="videoID"></div>
              <div class = "user_email" id="user_email">none</div>
            </div>
            </div>
          </>
            
  );
}

export default VideoPlayer;