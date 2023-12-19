import aws from "./AWS"; 

async function getDynamoData(id){
  let params = {
    TableName: "videos",
    Key: {
      video_id: id,
    }
  }

  return aws.dynamo.get(params).promise();
}

function updateDynamo(inputVal, signedInUserName, signedInUserImageKey, videoID, videoCategory){

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
    
    today = mm + '/' + dd + '/' + yyyy;
  
    var params = {
      TableName:"videos",
      Key:{
        video_id: videoID,
        category: videoCategory
      },
      "UpdateExpression" : "SET #attrName = list_append(#attrName, :attrValue)",
      "ExpressionAttributeNames" : {
        "#attrName" : "user_comments"
      },
      "ExpressionAttributeValues" : {
        ":attrValue" : [{
              "date" : today,
              "message" : inputVal,
              "username" : signedInUserName,
              "imageurl" : signedInUserImageKey
        }
        ]
      },
      ReturnValues:"UPDATED_NEW"
  };
  
  aws.dynamo.update(params, function(err, data) {

      console.log("Updating the item...");
      if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }

  });
}

function updatePlaylist(signedInUserEmail, videoID, videoCategory){
  
    var params = {
      TableName:"posfit_users",
      Key:{
        email_id: signedInUserEmail
      },
      "UpdateExpression" : "SET #attrName = list_append(#attrName, :attrValue)",
      "ExpressionAttributeNames" : {
        "#attrName" : "playlist"
      },
      "ExpressionAttributeValues" : {
        ":attrValue" : [{
              "video_id": videoID,
              "category": videoCategory
        }
        ]
      },
      ReturnValues:"UPDATED_NEW"
  };
  
  aws.dynamo.update(params, function(err, data) {
    console.log("Updating playlist...");
    if (err) {
      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
  });
}

async function getDynamoUser(email_id) {
  
  let params = {
    TableName: "posfit_users",
    Key: {
      email_id: email_id
    }
  }
  
  return aws.dynamo.get(params).promise();
}

async function scanTable(){
  let params = {
    TableName: "videos",
  }
  return aws.dynamo.scan(params).promise();
};

async function dynamoScan(category){  
  var params = {
    TableName: "videos",
    ProjectionExpression: "category, video_id, video_title",
    FilterExpression: "category = :category",
    ExpressionAttributeValues: {
         ":category": "Misc"
    }
  };

  console.log("Scanning table.");
  aws.dynamo.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      // print all the results
      console.log("Scan succeeded.");
      data.Items.forEach(function(item) {
        console.log(
          item.category + ": thumbnail id:",
          item.thumbnail_id, "- title:", item.video_title);
        }
      );

      // continue scanning if we have more, because
      // scan can retrieve a maximum of 1MB of data
      if (typeof data.LastEvaluatedKey != "undefined") {
        console.log("Scanning for more...");
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        aws.dynamo.scan(params, onScan);
      }
    }
  }
}; 

export {getDynamoData, updateDynamo, updatePlaylist, getDynamoUser, scanTable, dynamoScan};
