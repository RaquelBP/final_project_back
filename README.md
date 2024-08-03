# Final Backend Project of the Full Stack Bootcamp

## Overview
This project is the backend for a burger store, developed as part of a Full Stack Bootcamp. The store includes a product catalog, a shopping cart, and the ability to complete purchases. Additionally, it features admin authentication for managing products and orders. Optional email notifications can be sent upon order completion.

## Prerequisites
- Node.js (v20.12.2)
- npm (v10.5.0)
- PostgreSQL (v7.0.11)

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file:

- `DB_USER`
- `DB_HOST`
- `DB_NAME`
- `DB_PASSWORD`
- `DB_PORT`
- `SECRET_KEY`
- `EMAIL_USER`
- `EMAIL_PASS`
- `PORT`

## Installation

Clone the project

```bash
  git clone https://github.com/RaquelBP/final_project_back.git
```

Go to the project directory

```bash
  cd final_project_back
```

Install the dependencies of the project with npm

```bash
  npm install
```

Start the server

```bash
  node index.js
```

## Endpoints
### Public Endpoints
- GET /products: Get all products.
- POST /order: Create a new order.
- POST /order/:id/ticket: Send order completion email.

### Admin Endpoints (Require Authentication)

#### Authentication
- POST /users/login: Authenticate admin user.
- POST /users/register: Register a new admin user.

#### Products Management
- GET /users/admin/products: Get all products.
- POST /users/admin/products: Create a new product.
- PUT /users/admin/products/:product_id: Update a specific product.
- DELETE /users/admin/products/:product_id: Delete a specific product.


#### Orders Management
- GET /users/admin/orders: Get all orders.
- POST /users/admin/orders: Create a new order.
- PUT /users/admin/orders/:order_id: Update a specific order.
- DELETE /users/admin/orders/:order_id: Delete a specific order.

## Database

### Tables

#### product
- `product_id SERIAL PRIMARY KEY`
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `name VARCHAR(255) UNIQUE NOT NULL`
- `price NUMERIC(10, 2) NOT NULL`
- `minutes NUMERIC NOT NULL`
- `category VARCHAR(100)`
- `description TEXT`
- `image_link TEXT`

#### order
- `order_id SERIAL PRIMARY KEY`
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `total_minutes NUMERIC`
- `total_price NUMERIC(10, 2)`
- `status VARCHAR(255) NOT NULL`


#### orderproduct

- `order_product_id SERIAL PRIMARY KEY`
- `order_id INTEGER REFERENCES "order"(order_id)`
- `product_id INTEGER REFERENCES product(product_id)`
- `quantity INTEGER NOT NULL`
- `sub_total_price NUMERIC(10, 2) NOT NULL`
- `sub_total_minutes NUMERIC NOT NULL`

#### users

- `id SERIAL PRIMARY KEY`
- `email VARCHAR(255) UNIQUE NOT NULL`
- `password VARCHAR(255) NOT NULL`
- `name VARCHAR(255)`
- `is_admin BOOLEAN DEFAULT FALSE`


### Initial Data
```sql
  INSERT INTO product (name, price, minutes, category, description, image_link) VALUES 
('McDowell''s Menu', 15, 3, 'Menus', 'Famoso menú McDowell que incluye hamburguesa, patatas y bebida', 'https://mcdonalds.es/api/cms/images/mcdonalds-es/Zg03_Mt2UUcvBWtC_1080x943_McMenu_Mediano_BigMac.png?auto=format,compress'), 
('McDowell''s Menu Junior', 10, 2, 'Menus', 'El famoso menú McDowell que incluye hamburguesa, patatas, bebida, postre ¡y un juguete sorpresa! para los pequeños de la casa', 'https://mcdonalds.es/api/cms/images/mcdonalds-es/1b67ec16-b22b-417b-a118-df4602007246_2-HMChicken+Burger+Kids.png?auto=compress,format');

INSERT INTO users (email, password, name, is_admin) VALUES
('demo@demo.com', 'demo', 'Admin', True);

```