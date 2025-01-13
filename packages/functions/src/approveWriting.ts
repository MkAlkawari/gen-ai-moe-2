//const userID = event.requestContext.authorizer!.jwt.claims.sub;
import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Bucket } from 'sst/node/bucket';
import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { Table } from 'sst/node/table';
import * as AWS from 'aws-sdk';



const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  
    
     try {
      const userID = event.requestContext.authorizer!.jwt.claims.sub; // Target user ID
      const bucketName = Bucket.ExtractedTXT.bucketName; // Name of the Extracted txt S3 bucket
      const pdfBucket = Bucket.BucketTextract.bucketName;

      const dynamodb = new AWS.DynamoDB();
      const tableName = Table.Records.tableName;
      if (!event.body) {
          return { statusCode: 400, body: JSON.stringify({ message: "No body provided in the event" }) };
      }
      let p1Question;
      let p2Question;
      console.log("events:" , event.body);
      const parsedBody = JSON.parse(event.body)
      // Extract only the key from the audioUrls URL
      if (parsedBody.audioUrls) {
        parsedBody.audioUrls = parsedBody.audioUrls.split('/').pop()!;
      }
      console.log("The image key is:",  parsedBody.audioUrls)

      p1Question = parsedBody.validSections[0]
      p2Question = parsedBody.validSections[1]
      console.log(p1Question)
      console.log(p2Question)

      const transactItems: any[] = [];

        let id = uuidv4();
        let checker = true;
    
        while(checker) {
        const check = await dynamodb
        .query({
          TableName: tableName,
          KeyConditionExpression: 'PK = :pk AND SK = :sk',
          ExpressionAttributeValues: {
            ':pk': { S: 'writing' },  // String value for PK
            ':sk': { S: id },   // String value for SK
            },
            ProjectionExpression: 'PK, SK',
        })
        .promise(); 
        const checkQuestion = check.Items?.[0];
        if (checkQuestion) {
          // const sortKey = checkQuestion.SK?.S
          id = uuidv4();
        }
        else {
          checker = false;
        }
       }
       console.log("OUR id: ", id)
        transactItems.push({
          Put: {
            TableName: tableName,
            Item: {
                PK: { S: "writing" },
                SK: { S: id },
                P1: {
                    M: {
                        GraphDescription: { S: "This is a description" },
                        GraphKey: { S: parsedBody.audioUrls },
                        Question: { S: p1Question },
                    },
                },
                P2:{
                  M: {
                  Question: { S: p2Question },
                }
              }
            },
        },
        });
    
    transactItems.push({
      Update: {
          TableName: tableName,
          Key: { // Key is required for Update
              PK: { S: "writing" },
              SK: { S: "index" },
          },
          UpdateExpression: "SET #index = list_append(if_not_exists(#index, :empty_list), :new_element)",
          ExpressionAttributeNames: {
              "#index": "index"
          },
          ExpressionAttributeValues: {
              ":new_element": { L: [{ S: id }] },
              ":empty_list": { L: [] } // Important for creating the list if it doesn't exist
          },
      },
  });
    
const transactParams = { TransactItems: transactItems };
const command = new TransactWriteItemsCommand(transactParams);
const response = await dynamodb.transactWriteItems(transactParams).promise();
  // List all objects in the S3 bucket
  const objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();
  const objectsPDF = await s3.listObjectsV2({ Bucket: pdfBucket }).promise();


  let targetObjectKey: string | null = null;
  let targetObjectKeyPDF: string | null = null;


  // Find the object whose name contains the userID
  for (const obj of objects.Contents || []) {
    if (obj.Key && obj.Key.includes(userID) && obj.Key.includes("Writing")) {
      targetObjectKey = obj.Key;
      break;
    }
  }
  for (const obj of objectsPDF.Contents || []) {
      if (obj.Key && obj.Key.includes(userID) /*&&  obj.Key.includes("Listening")*/) {
        targetObjectKeyPDF = obj.Key;
        break;
      }
    }

  if (!targetObjectKey || !targetObjectKeyPDF) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: `No object found for userID: ${userID}` }),
    };
  }
  const sourceBucket = "speaking-questions-polly";
  const destinationBucket = "speaking-questions-polly";
  const objectKey = `unApproved/Writing/${parsedBody.audioUrls}`; // The original object key
  const fileType = objectKey.split('.').pop()
  const idKey = uuidv4()
  const newObjectKey = `${idKey}.${fileType}`; // New destination object key
    try {
      console.log("Inside the try block!");
  
      // Step 1: Get the object from the source bucket
      const objectData = await s3
        .getObject({
          Bucket: sourceBucket,
          Key: objectKey,
        })
        .promise();
      console.log("Object retrieved successfully:", objectData);
  
      // Step 2: Put the object in the destination bucket with the new key
      await s3
        .putObject({
          Bucket:  destinationBucket,
          Key: newObjectKey,
          Body: objectData.Body, // Use the retrieved object data
          ContentType: objectData.ContentType, // Optional: retain original content type
        })
        .promise();
      console.log(`Object uploaded successfully to `);
  
      // Step 3: Delete the object from the source bucket
      await s3
        .deleteObject({
          Bucket:  sourceBucket,
          Key: objectKey,
        })
        .promise();
      console.log(`Object deleted successfully from ${sourceBucket}/${objectKey}`);
    } catch (error) {
      console.log("Inside the catch block!");
      console.error("Error moving object:", error);
    }
  
  
  // Example usage:
  
  
  
  
  
  
  
  

  // Retrieve the content of the target object
  const targetObject = await s3
    .deleteObject({ Bucket: bucketName, Key: targetObjectKey })
    .promise();
  const targetObjectpdf = await s3
    .deleteObject({ Bucket: pdfBucket, Key: targetObjectKeyPDF })
    .promise();
  return { statusCode: 200, body: JSON.stringify({ message: "Questions imported successfully", response }) };
} catch (error) {
  console.error("Error during transaction:", error);
  return { statusCode: 500, body: JSON.stringify({ message: "Error importing questions", error: error }) };
} 
};
