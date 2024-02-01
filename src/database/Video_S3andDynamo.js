import aws from "./AWS";
import {createContext, useContext} from "react";
import {UserTableContext} from "./Dynamo_UserTable";
import { v4 as uuidV4 } from 'uuid';

const VideoContext = createContext();

function VideoDatabase(props) {
    const {appendVideoKey} = useContext(UserTableContext);

    function uploadVideo(username, email, video) {
        return new Promise((resolve, reject) => {

            // creates a meta-data entry for the following s3-stashed video
            let today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            today = mm + '/' + dd + '/' + yyyy;

            // creates the "unique" id per video to enforce uniqueness in s3.
            const unique_id = uuidV4();

            const params_dynamoVideos = {
                TableName: "videos",
                Item: {
                    // video and thumbnail image from s3
                    video_id: unique_id + ".mp4",
                    video_title: video.title,
                    thumbnail_id: unique_id + ".jpg",
                    category: video.category,
                    description: video.description,
                    date_of_publish: today,
                    // user profile-pic image from s3
                    creator_profile_pic: email + "_profile_pic.jpg",
                    creator_name: username,
                    user_comments: []
                }
            };

            // puts the entry in the videos table.
            aws.dynamo.put(params_dynamoVideos, (err) => {
                if(err) {
                    console.error(err, "could not enter new video entries in dynamodb videos table: " + video.title);
                    reject(err)
                } else {
                    console.log("uploading videos entry successful... loading videos onto s3..");
                    // append it to user's upload list
                    appendVideoKey(email, unique_id, false);

                    const params_thumbnail = {
                        Body: video.thumbnail,
                        Bucket: "posfit-bucket",
                        Key: unique_id + ".jpg",
                    }
                    // puts the thumbnail object in our s3 video bucket
                    aws.s3.putObject(params_thumbnail, (err) => {
                        if(err) {
                            console.error(err, "could not put thumbnail onto s3");
                            reject(err)
                        } else {
                            console.log("thumbnail upload success.");
                        }
                    });

                    const params_video = {
                        Body: video.video,
                        Bucket: "posfit-bucket",
                        Key: unique_id + ".mp4",
                    }
                    // puts the video object in our s3 video bucket
                    aws.s3.putObject(params_video, (err) => {
                        if(err) {
                            console.error(err, "could not put video onto s3");
                            reject(err)
                        } else {
                            console.log("video upload success.");
                            // TODO; grab back the entry to get the link aka call getS3url()
                            resolve(true);
                        }
                    });
                }

            });


        })
    }


    return (
        <VideoContext.Provider value={{uploadVideo}}>
            {props.children}
        </VideoContext.Provider>
    );
}

export {VideoContext, VideoDatabase};