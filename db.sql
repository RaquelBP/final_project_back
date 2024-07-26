CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(255) UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    minutes NUMERIC NOT NULL,
    category VARCHAR(100),
    description TEXT,
    image_link TEXT,
    amount INT DEFAULT 0,
    total_price DECIMAL(10, 2) DEFAULT 0,
    total_minutes INT DEFAULT 0
);

CREATE TABLE "order" (
    order_id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_minutes NUMERIC,
    total_price NUMERIC(10, 2),
    status VARCHAR(255) NOT NULL
);


CREATE TABLE OrderProduct (
    order_product_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES "order"(order_id),
    product_id INTEGER REFERENCES product(product_id),
    quantity INTEGER NOT NULL,
    sub_total_price NUMERIC(10, 2) NOT NULL,
    sub_total_minutes NUMERIC NOT NULL
);


INSERT INTO product (name, price, minutes, category, description, image_link) VALUES 
('McDowell''s Menu', 15, 3, 'Menus', 'Famoso menú McDowell que incluye hamburguesa, patatas y bebida', 'https://mcdonalds.es/api/cms/images/mcdonalds-es/Zg03_Mt2UUcvBWtC_1080x943_McMenu_Mediano_BigMac.png?auto=format,compress'), 
('McDowell''s Menu Junior', 10, 2, 'Menus', 'El famoso menú McDowell que incluye hamburguesa, patatas, bebida, postre ¡y un juguete sorpresa! para los pequeños de la casa', 'https://mcdonalds.es/api/cms/images/mcdonalds-es/1b67ec16-b22b-417b-a118-df4602007246_2-HMChicken+Burger+Kids.png?auto=compress,format');
