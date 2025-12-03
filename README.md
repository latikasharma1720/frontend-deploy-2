

#  MastoRide — Ride-Booking Platform for PFW Students

### **Full Stack Web Development — Group Project**

**Instructor:** Professor Thomas Bolinger

**Submitted By:**

* **Latika Sharma**
* **Tapasvini Adapala**
* **Nidhi Musale**

---

## Project Overview**

MastoRide is a ride-booking web application built exclusively for **Purdue University Fort Wayne (PFW)** students. The platform provides a safe, affordable, and structured way for students to book rides to off-campus locations. It includes role-based access for Guests, Registered Students, and Administrators, each with specific functionalities tailored to their needs.

---

## Problem Statement**

PFW students frequently encounter transportation challenges due to:

* Expensive commercial ride services
* Unreliable public transportation
* Lack of structured or student-friendly ride options
* No centralized place to track bookings, payments, or ride history

As a result, students may miss important academic and personal commitments.

A dedicated, student-focused transportation platform is required to provide **affordable**, **safe**, and **trackable** ride options.

---

## Solution**

MastoRide provides a centralized system for booking and managing rides, exclusively for PFW students.

### ✔ Student Dashboard

* Ride booking system
* Ride history
* Payment tracking
* Profile management

### ✔ Admin Dashboard

* Manage users
* Monitor bookings
* Review payments
* Ensure safety and compliance

### ✔ Guest Users

* View services
* Explore pricing
* Read FAQs
* Sign up with valid @pfw.edu email

MastoRide ensures affordability, accountability, and ease of use through role-based authentication and a modern responsive interface.

---

## Core Application Features**

### **1. User Authentication & Role-Based Access**

* Secure login and registration
* Email verification restricted to **@pfw.edu**
* Different dashboards for Guests, Students, and Admins

**Value:** Protects platform access and ensures data security.

---

### **2. Ride Booking & Management**

* Select pickup/drop-off
* Choose preferred time
* Store all booking information in dashboard
* Track booking status

**Value:** Removes reliance on informal transportation and provides structured scheduling.

---

### **3. Ride History & Payment Tracking**

* View all past rides
* Access receipts and payment statuses

**Value:** Enhances transparency and helps students track expenses.

---

### **4. Administrative Control Panel**

* Monitor live and past bookings
* Review student activity
* Generate reports
* Manage safety concerns

**Value:** Strengthens accountability and supports smooth platform operation.

---

### **5. Responsive & User-Friendly Interface**

* Modern UI built with React
* Mobile-friendly
* Smooth navigation across all pages

**Value:** Encourages adoption through ease of use and clarity.

---

## Technology Stack**

| Component           | Technology                                  | Explanation                                                                    |
| ------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| **Frontend**        | React, HTML, CSS, JavaScript                | Enables fast, responsive UI with reusable components.                          |
| **Backend**         | Node.js, Express.js                         | Efficient server-side handling and scalable API architecture.                  |
| **Database**        | MongoDB Atlas                               | Stores user profiles, ride history, and payment records securely in the cloud. |
| **Testing**         | Jest, Cypress                               | Ensures accurate component rendering and API endpoint validation.              |
      |

---

## Academic Values**

* Hands-on full-stack development experience
* Reinforces MERN stack concepts taught in class
* Strengthens project management skills via Jira and GitHub
* Prepares students for real-world software engineering environments

---

## Product Values**

* **Affordable & exclusive service** for PFW students
* **Transparent record-keeping** with ride and payment history
* **Highly scalable** MERN-based architecture
* **Smooth user experience** with responsive design
* **Safety & accountability** managed through admin tools

---

## Collaboration Plan**

### **1. Weekly Team Meetings**

* **Every Friday at 7 PM EST**
* Conduct sprint reviews
* Discuss blockers
* Plan next sprint items

---

### **2. Project Management 

* All user stories tracked through TRELLO BOARD
* Backlog grooming and sprint planning
* Transparent visibility of task assignments and progress

---

### **3. Communication Channels**

* **WhatsApp:** Daily updates
* **GitHub Issues:** Technical discussions, bugs, and documentation

---

### **4. Version Control Workflow**

#### Branching Strategy:

* Each feature built in its **own feature branch**
* Completed work merged into **Final-Frontend** or **Final-Backend** branches
* After verification, Final branches merged into **main**

**Value:** Ensures a clean, conflict-free, and organized development process.

---

# How to Run the Project (Local Development)**

### **1. Clone the repository**

```sh
git clone <repo-url>
cd <project-folder>
```

### **2. Install dependencies**

Frontend:

```sh
npm install
```

Backend:

```sh
cd server
npm install
```

### **3. Create a `.env` file in `/server`**

```
MONGO_URL=your_mongodb_atlas_string
JWT_SECRET=your_secret_key
```

### **4. Start Backend**

```sh
cd server
npm start
```

### **5. Start Frontend**

```sh
npm start
```



