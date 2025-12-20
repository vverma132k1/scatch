# 👜 Karry - Premium Bag Store (E-Commerce)

**Karry** (formerly Scatch) is a full-stack e-commerce application built with the **MERN Stack** logic (MongoDB, Express, Node.js) using **EJS** for server-side rendering. It features a modern, responsive design with Dark Mode support, a comprehensive Admin Dashboard, and real-time payment integration via Razorpay.

---

## 🔗 Links

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://karry-store.onrender.com)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/vverma132k1/karry)


---

## 🚀 Features

### 🛒 Customer Experience
* **Modern UI/UX:** Responsive design using Tailwind CSS with seamless **Dark Mode** support.
* **Smart Shop:**
    * **Advanced Filtering:** Filter by Price Range, Availability, and Collections (New/Discounted).
    * **Search & Sort:** Real-time search by name and sorting (Price Low-High, Newest, etc.).
    * **Pagination:** Easy navigation through large product catalogs.
* **User Accounts:** Secure Login/Signup with encrypted passwords (bcrypt) and session management (express-session).
* **Shopping Cart:** Add/remove items, update quantities instantly via AJAX.
* **Checkout:** Integrated **Razorpay** payment gateway for secure transactions.
* **Order History:** Users can view their past orders, invoice summaries, and payment status.
* **Profile Management:** Edit profile details and upload profile pictures with instant preview.

### 🔐 Admin Dashboard
* **Product Management:** Create, Edit, and Delete products with instant image previews.
* **Order Tracking:** View all customer orders in a detailed, sortable data table.
* **Inventory Control:** Manage stock levels and product availability.
* **Analytics:** View total sales and platform fee summaries.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Frontend:** EJS (Embedded JavaScript), Tailwind CSS
* **Authentication:** JSON Web Tokens (JWT), cookie-parser
* **Payments:** Razorpay API
* **Utilities:** Multer (Image Uploads), Dotenv, Connect-Flash, JOI (Validation)

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/karry-shop.git
cd karry-shop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following keys:

```env
# Database Connection
MONGODB_URI="mongodb+srv://<your_db_username>:<password>@cluster0.mongodb.net/test?appName=Cluster0"

# Session & Auth Secrets
EXPRESS_SESSION_SECRET="your_random_secret_string"
JWT_KEY="your_jwt_secret_key"

# Razorpay Payment Gateway (Test Mode Keys)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# Environment
NODE_ENV="development"
```

### 4. Seed the Database (Optional)

If you want to start with dummy products for testing:

```bash
node seed.js
```

### 5. Run the Server

```bash
npx nodemon app.js
```

The server will start on `http://localhost:3000`.

---

## 📂 Project Structure

```text
karry-shop/
├── config/             # Database connection setup (mongoose-connection.js)
├── middlewares/        # Auth checks (isLoggedIn.js)
├── models/             # Mongoose Schemas (User, Product, Owner)
├── public/             # Static assets (Images, CSS, JS)
├── routes/             # Express Routes (index, owners, products, users)
├── utils/              # Helper functions (token generation)
├── views/              # EJS Templates
│   ├── partials/       # Reusable components (header, footer)
│   ├── admin.ejs       # Admin Dashboard
│   ├── shop.ejs        # Main Storefront with Search/Filter
│   ├── cart.ejs        # Shopping Cart
│   └── index.ejs       # Login/Landing Page
├── .env                # Environment variables (Ignored by Git)
├── app.js              # Main application entry point
└── README.md           # Documentation
```

---

## 💳 Payment Integration (Test Mode)

This project uses Razorpay in **Test Mode**. No real money is deducted during transactions.

* **Test Card Details:** You can use any test card provided by Razorpay documentation.
* **Currency:** INR (₹)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by Vaibhav Verma**
