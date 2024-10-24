This assignment focuses on adding user authentication features to an existing web application using client sessions and MongoDB for data persistence. The key objectives are:

Part A: Implement user registration and login/logout functionality, ensuring only registered users can access post and category views. Non-registered users will only see the blog and about pages.

Part B: Secure user passwords by updating the storage logic to hash passwords using bcrypt.js.

The process involves creating a MongoDB database, developing an auth-service module to handle user data (e.g., storing and retrieving credentials), and setting up client session middleware using client-sessions to manage user login states.

Additional features include:

Password validation and hashing.
Login history tracking.
Middleware to protect routes and ensure only authenticated users can access specific views.
The assignment also requires creating new views for user login, registration, and user history, integrating them into the app with dynamic content based on the user's login state.
