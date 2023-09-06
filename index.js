require('dotenv').config();
const { PubSub } = require('@google-cloud/pubsub');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const fs = require('fs');

// Initialize a PubSub client
const pubsub = new PubSub();

// Configuration (Using environment variables)
const SUBSCRIPTION_NAME = process.env.SUBSCRIPTION_NAME || 'projects/global-shard-398022/subscriptions/better-stack-logs-sub';
const BETTER_STACK_ENDPOINT = 'https://in.logs.betterstack.com';
const SOURCE_TOKEN = process.env.SOURCE_TOKEN || 'G3L9LhxvdB8M3wGw7qZMgyw3';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10');
const FAILED_LOGS_PATH = "./failed_logs.txt";

// Axios instance with enhanced retry configuration
const axiosInstance = axios.create();
axiosRetry(axiosInstance, {
    retries: 3,
    retryDelay: (retryCount) => {
        return retryCount * 2000;  // retry after 2, 4, 6,... seconds
    }
});

let batchBuffer = [];

// Recursive function to scan and reorder timestamp in any object
function reorderTimestamp(obj) {
    if (obj && typeof obj === 'object') {
        if (obj.timestamp) {
            obj.dt = obj.timestamp;
            delete obj.timestamp;
        }
        for (const key in obj) {
            obj[key] = reorderTimestamp(obj[key]);
        }
    }
    return obj;
}

function cacheFailedLog(logData) {
    fs.appendFileSync(FAILED_LOGS_PATH, JSON.stringify(logData) + "\n");
}

// Helper function to send logs to Better Stack
async function sendToBetterStack(logData) {
    try {
        await axiosInstance.post(
            BETTER_STACK_ENDPOINT,
            logData,
            {
                headers: {
                    'Authorization': `Bearer ${SOURCE_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error(`Failed to send message to Better Stack: ${error.message}`);
        if (!logData.error) {
            cacheFailedLog(logData);  // Save the log to local storage
        }
    }
}

// Function to process messages from Pub/Sub
function processMessage(message) {
    const rawMessage = message.data.toString();

    let payload;
    try {
        payload = JSON.parse(rawMessage);
        payload = reorderTimestamp(payload);
    } catch (error) {
        payload = { "message": rawMessage };
    }

    // Add payload to the batch buffer
    batchBuffer.push(payload);

    // If the buffer reaches the BATCH_SIZE, send all messages in a single request
    if (batchBuffer.length >= BATCH_SIZE) {
        sendToBetterStack(batchBuffer);
        batchBuffer = [];  // Clear the buffer
    }

    // Acknowledge the message
    message.ack();
}

// Listen to the subscription
const subscription = pubsub.subscription(SUBSCRIPTION_NAME);
subscription.on('message', processMessage);
subscription.on('error', error => {
    const errorLog = {
        message: 'Received error from Pub/Sub subscription',
        error: error.message
    };
    sendToBetterStack(errorLog);
});

// Ensure any remaining logs in buffer are sent when process is terminated
process.on('beforeExit', () => {
    if (batchBuffer.length > 0) {
        sendToBetterStack(batchBuffer);
    }
});

// Log and send initialization info to Logtail
const initMessage = `Listening to subscription: ${SUBSCRIPTION_NAME}`;
sendToBetterStack({ message: initMessage });