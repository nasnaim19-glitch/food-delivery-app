# Food Delivery App

A full-stack food delivery application inspired by platforms such as Wolt.

The project allows users to browse restaurants and menus, register and log in, manage a shopping cart, place orders, view order history and tracking, save favorite restaurants, and receive personalized recommendations.

The application was built as a Full-Stack project using React, Node.js, Express, Prisma, PostgreSQL, Docker, and GitHub Actions.

---

## Features

### Public Features

- Browse restaurants
- View restaurant details
- Browse menu categories
- View products
- Search and filter restaurants/products
- View Happy Hour discounts
- View the Home Page and restaurant recommendations section

### Authentication

- User registration
- User login
- Password hashing with bcrypt
- JWT authentication
- Protected routes using authentication middleware

### Cart

- Add products to cart
- Update product quantities
- Remove products
- Calculate cart total
- Happy Hour pricing support

### Orders

- Create orders
- Save order items
- View order history
- View order details
- Reorder a previous order
- Automatic order status progression
- Order tracking

### Favorites

- Add restaurants to favorites
- Remove restaurants from favorites
- View saved favorite restaurants

### Recommendations

- Personalized restaurant recommendations
- Personalized product recommendations
- Recommendations based on:
  - Previous orders
  - Favorite restaurants
  - Preferred categories
  - Restaurant rating
- Recommendation scoring
- Recommendations sorted by score

### Happy Hour

- Restaurants can have Happy Hour settings
- Discounted product prices during active Happy Hour
- Original and discounted prices are stored in orders

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Styled Components
- Vitest
- Testing Library

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Neon Database
- JWT
- bcrypt
- Morgan
- Winston
- Supertest
- Node Test Runner

### DevOps

- Git
- GitHub
- Docker
- Docker Compose
- GitHub Actions CI

---

## Project Structure

```text
food-delivery-app
│
├── .github
│   └── workflows
│       └── ci.yml
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── package-lock.json
│
├── server
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── routes
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests
│   ├── logs
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── package-lock.json
│
├── docker-compose.yml
├── README.md
└── LICENSES_ALL