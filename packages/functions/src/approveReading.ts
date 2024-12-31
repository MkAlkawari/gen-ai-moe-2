//const userID = event.requestContext.authorizer!.jwt.claims.sub;
import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Bucket } from 'sst/node/bucket';
import { v4 as uuidv4 } from 'uuid';
import { Table } from 'sst/node/table';
import * as AWS from 'aws-sdk';
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { json } from 'stream/consumers';

const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestBody = event.body ? JSON.parse(event.body) : null;
  console.log("Parsed event body:", requestBody);
  try {
    let questionID = "";
    let questionID2 = "";
    const dynamodb = new AWS.DynamoDB();
          const tableName = Table.Records.tableName;
          if (!event.body) {
              return { statusCode: 400, body: JSON.stringify({ message: "No body provided in the event" }) };
          }
          let p1Question;
          let p2Question;
          const parsedBody = JSON.parse(JSON.parse(event.body))
          p1Question = parsedBody[0]
          p2Question = parsedBody[1]
          console.log(p1Question)
          console.log(p2Question)
          
    
          const transactItems: any[] = [];
    //       for (const question of parsedBody) {
    //         let id = uuidv4();
      
    //         let checker = true;
        
    //         while(checker)
    //         {
            
    //         const check = await dynamodb
    //         .query({
    //           TableName: tableName,
    //           KeyConditionExpression: 'PK = :pk AND SK = :sk',
    //           ExpressionAttributeValues: {
    //             ':pk': { S: 'writing' },  // String value for PK
    //             ':sk': { S: id },   // String value for SK
    //             },
    //             ProjectionExpression: 'PK, SK',
    //         })
    //         .promise(); 
    //         const checkQuestion = check.Items?.[0];
    //         if (checkQuestion) {
    //           const writingKey = checkQuestion.PK?.S
    //           const sortKey = checkQuestion.SK?.S
    //           id = uuidv4();
    //         }
    //         else {
    //           checker = false;
    //           if(questionID != "")
    //             questionID2 = id
    //           else
    //             questionID = id
    //         }
            
    //        }
    //        console.log("OUR id: ", id)
    //         transactItems.push({
    //           Put: {
    //             TableName: tableName,
    //             Item: {
    //                 PK: { S: "writing" },
    //                 SK: { S: id },
    //                 P1: {
    //                     M: {
    //                         graphDescription: { S: "This is a description" },
    //                         graphKey: { S: "graph123" },
    //                         Question: { S: p1Question },
    //                     },
    //                 },
    //                 P2:{
    //                   M: {
    //                   question: { S: p2Question },
    //                 }
    //               }
    //             },
    //         },
    //         });     
    //     }
        
    //     transactItems.push({
    //       Update: {
    //           TableName: tableName,
    //           Key: { // Key is required for Update
    //               PK: { S: "writing" },
    //               SK: { S: "index" },
    //           },
    //           UpdateExpression: "SET #index = list_append(if_not_exists(#index, :empty_list), :new_element)",
    //           ExpressionAttributeNames: {
    //               "#index": "index"
    //           },
    //           ExpressionAttributeValues: {
    //               ":new_element": { L: [{ S: questionID }, { S: questionID2 }] },
    //               ":empty_list": { L: [] } // Important for creating the list if it doesn't exist
    //           },
    //       },
    //   });
        
    // const transactParams = { TransactItems: transactItems };
    // const command = new TransactWriteItemsCommand(transactParams);
    // const response = await dynamodb.transactWriteItems(transactParams).promise();
    const id = "123"
    transactItems.push({
      Put: {
        TableName: tableName,
        Item: {
          PK: { S: "passage" },
          SK: { S: id },
          P1: {
            M: {
              NumOfQuestions: { N: "3" },
              Passage: { S: "This is a sample passage text used for testing." },
              PassageTitle: { S: "Sample Passage Title" },
              Questions: {
                L: [
                  {
                    M: {
                      NumOfSubQuestions: { N: "2" },
                      Question: { S: "What is the main idea of the passage?" },
                      QuestionType: { S: "Multiple Choice" },
                      SubQuestion: {
                        L: [
                          {
                            M: {
                              CorrectAnswers: {
                                L: [{L: [{ S: "A" }]}]
                                
                              },
                              QuestionText: { S: "The main idea is:" },
                              QuestionWeight: { N: "1" },
                              RowTitle: { S: "Main Idea" }
                            }
                          },
                          {
                            M: {
                              CorrectAnswers: {
                                L: [{ S: "B" }]
                              },
                              QuestionText: { S: "The secondary idea is:" },
                              QuestionWeight: { N: "1" },
                              RowTitle: { S: "Secondary Idea" }
                            }
                          }
                        ]
                      }
                    }
                  },
                  {
                    M: {
                      List: { S: "a b c d e " },
                      ListTitle: { S: "Sample List Title" },
                      NumOfSubQuestions: { N: "1" },
                      Question: { S: "Select the correct options from the list." },
                      QuestionType: { S: "List Selection" },
                      SubQuestions: {
                        L: [
                          {
                            M: {
                              choices: {
                                L: [{ S: "Option 1" }, { S: "Option 2" }, { S: "Option 3" }]
                              },
                              correctAnswer: { S: "Option 2" },
                              QuestionText: { S: "Which option is correct?" }
                            }
                          }
                        ]
                      }
                    }
                  },
                  {
                    M: {
                      NumOfSubQuestions: { N: "1" },
                      Question: { S: "Which of these is an example of something described in the passage?" },
                      QuestionType: { S: "Single Choice" },
                      SubQuestions: {
                        L: [
                          {
                            M: {
                              choices: {
                                L: [{ S: "Example 1" }, { S: "Example 2" }, { S: "Example 3" }]
                              },
                              CorrectAnswer: { S: "Example 3" },
                              QuestionText: { S: "Choose one correct example." }
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    });
    const transactParams = { TransactItems: transactItems };
    const command = new TransactWriteItemsCommand(transactParams);
    const response = await dynamodb.transactWriteItems(transactParams).promise();
    const userID = event.requestContext.authorizer!.jwt.claims.sub; // Target user ID
    const bucketName = "mohdj-codecatalyst-sst-ap-extractedtxtbucket87b8ca-ijzohbu9cf75"; // Name of the S3 bucket
    const pdfBucket = Bucket.BucketTextract.bucketName;

    // List all objects in the S3 bucket
    const objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();
    const objectsPDF = await s3.listObjectsV2({ Bucket: pdfBucket }).promise();


    let targetObjectKey: string | null = null;
    let targetObjectKeyPDF: string | null = null;


    // Find the object whose name contains the userID
    for (const obj of objects.Contents || []) {
      if (obj.Key && obj.Key.includes(userID) && obj.Key.includes("Reading")) {
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

    // Retrieve the content of the target object
    const targetObject = await s3
      .deleteObject({ Bucket: bucketName, Key: targetObjectKey })
      .promise();
    const targetObjectpdf = await s3
      .deleteObject({ Bucket: pdfBucket, Key: targetObjectKeyPDF })
      .promise();

    
    

    return {
        statusCode: 200,
        body: JSON.stringify({
          
        }),
      };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error'}),
    };
  }
};
