const { randomUUID } = require("crypto");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8080;
const webpush = require("web-push");

// Fancy data store for subscriptions ;)
let subscriptionDb;

webpush.setVapidDetails(
  "mailto:ajgoley@gmail.com", // Needs to let push provider know how to contact owner
  process.env.PUBLIC_KEY,
  process.env.PRIVATE_KEY,
);

// Configure CORS for my PWA origin
const corsOptions = {
  origin: "https://agoley.github.io", // Accept requests from my PWA
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers)
};

app.use(cors(corsOptions));

// Middleware for parsing JSON data
app.use(express.json());

// Define a root route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Route for saving a subscription
app.post("/api/save-subscription/", (req, res) => {
  if (!isValidSaveRequest(req, res)) {
    return;
  }

  return saveSubscriptionToDatabase(req.body)
    .then(() => {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify({ data: { success: true } }));
    })
    .catch((err) => {
      res.status(500);
      res.setHeader("Content-Type", "application/json");
      res.send(
        JSON.stringify({
          error: {
            id: "unable-to-save-subscription",
            message:
              "The subscription was received but we were unable to save it to our database.",
          },
        }),
      );
    });
});

app.post("/api/trigger-push-msg/", (req, res) => {
  return getSubscriptionsFromDatabase().then((subscription) => {
    return triggerPushMsg(
      subscription,
      JSON.stringify({
        tag: new Date().getTime(),
      }),
    );
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

function isValidSaveRequest(req, res) {
  let subscription = req.body;
  return subscription.endpoint && subscription.keys;
}

function saveSubscriptionToDatabase(subscription) {
  subscriptionDb = subscription;
  return new Promise((resolve, reject) => resolve(subscription));
}

function deleteSubscriptionFromDatabase() {
  subscriptionDb = null;
  return new Promise((resolve, reject) => resolve(subscription));
}

function getSubscriptionsFromDatabase() {
  return new Promise((resolve, reject) => resolve(subscriptionDb));
}

const triggerPushMsg = function (subscription, dataToSend) {
  return webpush.sendNotification(subscription, dataToSend).catch((err) => {
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log("Subscription has expired or is no longer valid: ", err);
      return deleteSubscriptionFromDatabase();
    } else {
      throw err;
    }
  });
};
