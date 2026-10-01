*SmartServe*

SmartServe is a full-stack service management system that helps users request and manage services from a single platform.

The main idea behind this project is to make the service request process simple, organized, and easy to track. Users can browse available services, create requests, and check the current status of their requests.

The project also includes a backend system for handling users, services, authentication, and service requests.


1. What is SmartServe?

SmartServe provides a single platform where users can request services and track their requests.

Instead of depending on manual communication, the complete process can be handled through the application.

a) User Side :

  • Users can register, log in, view available services, create service requests, and track their request status.

b) Service Management :

  • Services can be added and managed through the system. Users can select the service they need and create a request.

c) Request Tracking :

  • After creating a request, users can check whether the request is pending, assigned, in progress, or completed.

  • Pending → Assigned → In Progress → Completed


2. Features :

a) User Authentication :

  • Users can create an account and log in securely. JWT is used to authenticate users and protect private routes.

b) Service Management :

  • Users can view the available services and select the service they want to request.

c) Service Requests :

  • Users can create a request for a particular service. The request is stored in the database and can be accessed later.

d) Request Tracking :

  • Users can track the current status of their service requests.

  • A request can move through stages such as:

    Pending → Assigned → In Progress → Completed

e) Role-Based Access :

  • Different users can have different permissions. For example, a normal user can create and track requests, while an admin can manage users, services, and requests.

f) REST APIs :

  • The frontend communicates with the backend through REST APIs for authentication, services, requests, and other operations.


3. Tech Stack :

a) Frontend :

  • React.js
  • JavaScript
  • HTML5
  • CSS3

  • React.js is used to build the user interface and create reusable components.

b) Backend :

  • Node.js
  • Express.js
  • REST APIs

  • Node.js and Express.js are used to handle API requests, authentication, business logic, and communication with the database.

c) Database :

  • MongoDB

  • MongoDB is used to store users, services, service requests, and other application data.

d) Authentication :

  • JWT (JSON Web Token)

  • JWT is used to authenticate users and protect private APIs.

e) Development Tools :

  • Git
  • GitHub
  • Postman
  • VS Code
  • MongoDB


4. How SmartServe Works :

The basic flow of the application is:

  • User

  • Register / Login

  • View Available Services

  • Select a Service

  • Create Service Request

  • Request Stored in Database

  • Request Assigned / Processed

  • Status Updated

  • User Tracks Request


a) User Registration/Login :

  • The user first creates an account or logs into an existing account.

b) Service Selection :

  • After logging in, the user can view the available services and select the required service.

c) Request Creation :

  • The user submits the required details and creates a service request.

d) Request Processing :

  • The request is stored in MongoDB and can then be assigned and processed.

e) Status Tracking :

  • The status of the request is updated as the service progresses, allowing the user to track it.


5. Authentication :

SmartServe uses JWT-based authentication.

The basic authentication flow is:

  User enters login details
          ↓
  Frontend sends login request
          ↓
  Backend verifies credentials
          ↓
  JWT token is generated
          ↓
  Token is sent to frontend
          ↓
  Frontend sends token with protected requests
          ↓
  Backend verifies token
          ↓
  Request is allowed


a) Registration :

  • A new user provides their details and creates an account.

b) Login :

  • The backend verifies the user's credentials.

c) Token Generation :

  • After successful login, the server generates a JWT token.

d) Protected Routes :

  • The token is checked before allowing access to protected APIs.


6. Project Structure :

• SmartServe

  • client

    • src

      • components

      • pages

      • services

      • context

      • App.js

    • package.json

  • server

    • controllers

    • models

    • routes

    • middleware

    • config

    • server.js

    • package.json

  • .gitignore

  • README.md


a) Client :

  • The "client" folder contains the React frontend, including pages, components, and API-related code.

b) Server :

  • The "server" folder contains the Node.js and Express backend, including routes, controllers, models, and middleware.


7. API Overview :

a) Authentication APIs :

  • Register User

    POST /api/auth/register

    Used to create a new user account.

  • Login User

    POST /api/auth/login

    Used to authenticate a user and generate a JWT token.

b) Service APIs :

  • Get Services

    GET /api/services

    Used to fetch all available services.

  • Add Service

    POST /api/services

    Used to add a new service.

c) Request APIs :

  • Create Service Request

    POST /api/requests

    Used to create a new service request.

  • Get Service Requests

    GET /api/requests

    Used to fetch service requests.

  • Get Request Details

    GET /api/requests/:id

    Used to get details of a specific request.

  • Update Request

    PUT /api/requests/:id

    Used to update the details or status of a request.

  • Delete Request

    DELETE /api/requests/:id

    Used to delete a service request.


8. Database Structure :

MongoDB is used to store the application data.

a) Users :

  • Stores information related to registered users.

b) Services :

  • Stores the services available on the platform.

c) Service Requests :

  • Stores the requests created by users.

  • A service request can contain information such as:

    {
      "userId": "user_id",
      "serviceId": "service_id",
      "status": "Pending",
      "createdAt": "timestamp"
    }


9. User Roles :

a) User :

  • A normal user can:

    • Register and log in
    • View available services
    • Create service requests
    • View their requests
    • Track request status
    • View request history

b) Service Provider :

  • A service provider can:

    • View assigned requests
    • Accept requests
    • Update request status
    • Manage assigned services
    • Mark requests as completed

c) Admin :

  • An admin can manage the overall application.

  • Admin operations can include:

    • Managing users
    • Managing services
    • Viewing requests
    • Assigning requests
    • Updating request information


10. Getting Started :

Follow these steps to run SmartServe locally.

a) Clone the Repository :

  git clone <repository-url>
  cd SmartServe

b) Install Frontend Dependencies :

  cd client
  npm install

c) Install Backend Dependencies :

  cd ../server
  npm install

d) Configure Environment Variables :

  • Create a ".env" file inside the "server" folder.

  PORT=5000
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret

e) Start the Backend :

  cd server
  npm start

f) Start the Frontend :

  • Open another terminal and run:

  cd client
  npm start

  • The application will normally be available at:

  http://localhost:3000


11. Why I Built SmartServe :

I wanted to build something that was more than a basic CRUD application.

While working on SmartServe, I wanted to understand how a real-world application handles authentication, different user roles, service requests, APIs, and database operations together.

The project also helped me understand how the frontend and backend communicate with each other in a complete full-stack application.


12. Challenges Faced :

a) Authentication and Authorization :

  • Making sure that only authenticated users could access protected features was one of the important parts of the project.

  • I also had to make sure that users could only perform actions allowed by their role.

b) Frontend and Backend Integration :

  • Connecting the React frontend with the Express backend and handling API responses properly was another important part of the project.

c) Database Management :

  • Managing users, services, and service requests required a proper database structure so that the required information could be stored and retrieved easily.

d) Error Handling :

  • The application also needs to handle invalid requests, incorrect inputs, and server-side errors without breaking the user experience.


13. What I Learned :

While building SmartServe, I got practical experience with:

  • Full-stack web development

  • React.js

  • Node.js and Express.js

  • REST API development

  • MongoDB

  • JWT authentication

  • Protected routes

  • Role-based authorization

  • Frontend-backend integration

  • API testing using Postman

  • Git and GitHub


14. Future Improvements :

Some features that can be added in the future are:

  • Real-time notifications

  • Email and SMS notifications

  • Online payment integration

  • Rating and review system

  • Advanced admin dashboard

  • Better analytics and reports

  • Location-based service tracking

  • AI-based service recommendations

  • Mobile application


15. Screenshots :

Screenshots of the application can be added here to show the main pages and features.

a) Login Page :

  • login.png

  • Shows the user login interface.

b) Register Page :

  • register.png

  • Shows the user registration interface.

c) Dashboard :

  • dashboard.png

  • Shows the main user dashboard after login.

d) Services Page :

  • services.png

  • Shows the list of available services.

e) Service Request Page :

  • request.png

  • Shows the interface used to create and manage service requests.

f) Admin Dashboard :

  • admin-dashboard.png

  • Shows the admin interface for managing users, services, and requests.


16. Contributing :

If you want to contribute to this project:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit the changes
5. Push the branch
6. Create a Pull Request


17. License :

This project was created for learning and development purposes.


18. Author :

Naman Singh Jarodiya

SmartServe was built as a full-stack project to understand how a real-world service management system can be designed and developed using modern web technologies.
