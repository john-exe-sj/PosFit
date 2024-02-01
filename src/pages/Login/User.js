import "../../css/User.css"
import React, {useContext, useEffect, useState} from 'react';
import { Link } from "react-router-dom";
import {AccountContext} from "../../database/AccContext_Session";
import {useHistory} from "react-router-dom";
import {UserTableContext} from "../../database/Dynamo_UserTable";
import { getDynamoUser } from "../../database/Dynamo_Video"
import aws from "../../database/AWS"; 



//import UploadVideo from "./UploadVideo";
//import Playlist from "./Playlist";

function User() {
    /**
     * This component displays the user-page, should show the user's;
     * username, bio, playlist, etc.
     */
    const [status, setStatus] = useState(false);
    const [email, setEmail] = useState("")
    const [username, setUserName] = useState("");
    const [userType, setUserType] = useState("");
    const [bio, setBio] = useState("");
    const [profilePicId, setProfilePicId] = useState("");
    const [video_id, setVideoId] = useState(null);
    const [playlist_id, setPlaylistId] = useState(null);

    const {getSession, logout} = useContext(AccountContext);
    const {retrieveUser, appendVideoKey, removeVideoKey} = useContext(UserTableContext)
    const history = useHistory();

    // grabs the user session once, and uploads the user page with user's information.
    useEffect(() => {
        if (!status) {
            getSession().then((data) => {
                console.log("Session In User: ", data);
                if(data) {
                    setEmail(data.email)
                    return data.email
                } else {
                    console.error("Error in user-page:\n", data);
                    history.push("/login"); 
                    return undefined;
                }
            }).then(email => {
                retrieveUser(email).then(result => {
                    const data = result.Item
                    /**
                    * TODO: fill in user-page with user info
                    *      data = {
                    *          playlist: Array[] : list of video_id's stored in s3
                    *          video_id: Array[] : list of video_id's that the user uploaded stored in s3.
                    *      }
                    */
                    setUserType(data.user_type);
                    setUserName(data.user_name);
                    setBio(data.bio);
                    setProfilePicId(aws.s3.getS3url(data.user_profile));
                    setVideoId(data.video_id);
                    setPlaylistId(data.playlist);
                    setStatus(true); 
                }); 
            }); 
        }
    }, [status]); 

    // functions to handle changing pages
    function handleChangePass(e) {
        e.preventDefault();
        history.push("/change_password");
    }

    function handleUpload(e){
        e.preventDefault();
        history.push("/upload_video");
    }

    
    function renderUserPage() {
        return (
            <div className="userpage-container">
                <div className="user-profile-bar">
                    <img className="user-profile-pic" src={profilePicId} alt="profilePic"/>
                    <div className="user-profile-type">
                        <span>{userType}</span>
                    </div>
                    <div className="user-profile-content">
                        <div style={{ width: '50%'}}>NAME</div>
                        <div>{username}</div>
                    </div>
                    <div className="user-profile-content">
                        <div style={{ width: '50%'}}>EMAIL</div>
                        <div>{email}</div>
                    </div>
                    <div className="user-profile-bio">
                        <div style={{ width: '50%', fontSize: '1.25rem', fontWeight: '700'}}>BIO</div>
                        <div style={{ width: '100%', wordWrap: 'break-word', fontSize: '1rem'}}>{bio}</div>
                    </div>
                    <div className="setting-buttons">
                        <button className="reset-password" onClick={handleChangePass} >RESET PASSWORD</button>
                    </div>
                </div>
                <div className="video-playlist-bar">
                    <Link to={`/playlist/${email}`} id="playlist-link" className="playlist-link"> Your uploaded videos </Link>
                    <div style={{  width: '100%', borderBottom: '1px solid black', marginTop: '2rem'}} />
                    <div className="video-playlist-content"></div>
                    <div style={{  width: '100%', borderBottom: '1px solid black', marginTop: '2rem'}} />
                    <div className="video-playlist-bt">
                        <button onClick={handleUpload} className="video-playlist-button">UPLOAD NEW VIDEO</button>
                    </div>
                </div>
                
            </div>
        );
    }

    return (
        <div className="user-page">
            {status ? renderUserPage(): "please login"}
        </div>
    );
}

export default User;
