# 🌩 Google Cloud Pub/Sub to Better Stack Logging Integration

This app bridges the gap between Google Cloud Pub/Sub and Better Stack logging. It actively listens to messages (logs) from a Pub/Sub subscription, batches them, and then promptly forwards them to Better Stack.

## 🛠 Prerequisites

- Node.js installed
- An active Google Cloud Platform (GCP) account with permissions to create and manage resources

## 🚀 Setup

### 1. **🔐 Set Up Better Stack**

#### a. Create an HTTP Source:

1. Log in to your Better Stack dashboard.
2. Navigate to the "Sources" section.
3. Click "Add Source".
4. Select "HTTP" as the source type.
5. Name your source, e.g., `gcp-logs-source`.
6. After the source is created, you'll see a Source Token. Keep this token safe; it's crucial for configuring the app.

### 2. **☁️ Set Up Google Cloud Pub/Sub**

#### a. Create a Topic:

1. Go to the Pub/Sub section in the GCP Console.
2. Hit the button to create a new topic.
3. Jot down the topic name for later.

#### b. Spin Up a Subscription:

1. Within the topic, initiate a new subscription.
2. Choose the "Pull" delivery method.
3. Remember the subscription name.

#### c. Craft a Log Sink:

1. Head to the Logging section in the GCP Console.
2. Opt for "Logs Router".
3. Click "Create Sink".
4. Set the sink service to "Pub/Sub" and pick the topic you previously made.
5. Apply your desired filters. For instance, to sieve out audit logs, use: `logName:"cloudaudit.googleapis.com%2Factivity"`.

#### d. Designate Labels (Optional):

To refine your log filtering, establish labels in the GCP Logging space. For example, to focus on audit logs, introduce a label titled "audit" with the filter: `logName:"cloudaudit.googleapis.com%2Factivity"`.

Certainly! Creating an IAM service account with the necessary permissions to access a Pub/Sub subscription is an essential step for an app that interacts with GCP services. Here's how to add the required section to your README:

### 2.5 **🔒 Create IAM Service Account and Obtain Key**

#### a. **Construct a Service Account**:

1. Go to the IAM & Admin section in the GCP Console.
2. Navigate to "Service Accounts".
3. Click on "Create Service Account".
4. Provide a name and description for the service account, e.g., `pubsub-better-stack-bridge`.
5. Click "Create".

#### b. **Assign Required Permissions**:

1. On the Service account permissions (optional) page, click "Continue".
2. On the Grant this service account access to project section, click on "Add Another Role".
3. In the role search box, type and select `Pub/Sub Subscriber`.
4. Click on "Continue" and then "Done".

#### c. **Obtain JSON Key for Service Account**:

1. Locate the service account you just created in the Service Accounts list and click on it.
2. Go to the "Keys" tab.
3. Click on the "Add Key" button and choose "JSON".
4. The JSON key will automatically download to your machine. Keep this file safe and do not commit it to your repository. This key will be used by your app to authenticate against the GCP.

#### d. **Integrate Service Account Key in Your App**:

1. Move the downloaded JSON key file to your app's root directory (or any directory of your choice, but adjust the path accordingly).
2. Update your `.env` file or your application's environment variables to include the path to the JSON key:

```bash
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account_key.json
```

Now, when you run your app, it will use the service account's credentials to authenticate with GCP and access the Pub/Sub subscription.

### 3. **💻 Set Up the App Locally**

#### a. Get the repository:

```bash
git clone [repository-url]
cd [repository-directory]
```

#### b. Inject dependencies:

```bash
npm install
```

#### c. Define environment variables:

- Conjure up a `.env` file in the top directory.
- Include these variables:

```bash
SUBSCRIPTION_NAME=your-gcp-subscription-name
SOURCE_TOKEN=your-better-stack-source-token
BATCH_SIZE=your-preferred-batch-size  # 10 is the default
GOOGLE_PROJECT_ID=your-gcp-project-id
```

#### d. Launch the app:

```bash
node index.js
```

### 4. **🌐 Deployment Options**

#### a. Soaring on Google Cloud Platform:

##### Google Cloud Run:

1. Construct a Docker image for the app.
2. Shuttle the Docker image to the Google Container Registry.
3. Deploy the image-containing container to Cloud Run.

##### Google App Engine:

1. Ensure you have the `app.yaml` configuration file in your project directory.
2. Run the command:
   ```bash
   gcloud app deploy
   ```

3. Access your app using the link provided after successful deployment.

#### b. Cloud Hopping:

This app can also take flight on other platforms such as AWS (with Elastic Beanstalk or Lambda), Azure (via Azure App Services), or any environment that's friendly to Node.js applications.

## 📜 License

This project waves the MIT License flag.
