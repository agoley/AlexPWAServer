const { randomUUID } = require("crypto");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 443;

// Fancy data store for subscriptions ;)
let subscriptionDb = null;

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

// Route for saving a subscription
app.post("/api/save-subscription/", function (req, res) {
  if (!isValidSaveRequest(req, res)) {
    return;
  }

  return saveSubscriptionToDatabase(req.body)
    .then(function () {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify({ data: { success: true } }));
    })
    .catch(function (err) {
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

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

function isValidSaveRequest(req, res) {
  let subscription = req.body;

  return subscription.endpoint && subscription.keys;
}

function saveSubscriptionToDatabase(subscription) {
  console.log(subscription);
  subscriptionDb = subscription;
  return new Promise.resolve();
}
