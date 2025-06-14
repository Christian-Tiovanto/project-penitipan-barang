import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE app_settings 
    (
      id serial not null primary key,
      setting_name varchar(50), 
      setting_value varchar(50), 
      created_at timestamp with time zone default current_timestamp, 
      updated_at timestamp with time zone default current_timestamp
    );

    CREATE TYPE order_status AS ENUM ('pending', 'partial', 'completed');

    CREATE TABLE ar
    (
      id serial not null primary key,
      customerId int, 
      invoiceId int, 
      ar_no varchar(50) not null, 
      total_bill int not null, 
      total_paid int not null, 
      to_paid int not null, 
      status order_status not null default 'pending',
      paid_date timestamp with time zone, 
      created_at timestamp with time zone default current_timestamp, 
      updated_at timestamp with time zone default current_timestamp
    );

    CREATE TABLE ar_payment
    (
      id serial not null primary key,
      arId int, 
      payment_method_name varchar(50), 
      customerId int, 
      total_paid int, 
      transfer_date timestamp with time zone,
      reference_no varchar(50),
      updated_at timestamp with time zone default current_timestamp,
      created_at timestamp with time zone default current_timestamp
    );

    CREATE TYPE cashflow_type AS ENUM ('in', 'out');
    CREATE TYPE cashflow_from AS ENUM ('input', 'payment');

    CREATE TABLE cashflows
    (
      id serial not null primary key,
      type cashflow_type not null,
      "from" cashflow_from not null,
      amount int not null,
      descriptions varchar(255),
      total_amount int not null,
      created_byId int,
      updated_at timestamp with time zone default current_timestamp,
      created_at timestamp with time zone default current_timestamp
    );

    CREATE TYPE charges_type AS ENUM ('input', 'payment');

    CREATE TABLE charges
    (
      id serial not null primary key,
      type charges_type not null,
      amount decimal(10,2) not null,
      updated_at timestamp with time zone default current_timestamp,
      created_at timestamp with time zone default current_timestamp 
    );

    CREATE TABLE customer_payments
    (
      id serial not null primary key,
      customerId int,
      payment_methodId int,
      charge decimal(10,2) not null,
      status boolean not null default true,
      sort boolean not null default true,
      min_pay int not null,
      updated_at timestamp with time zone default current_timestamp,
      created_at timestamp with time zone default current_timestamp
    );

    CREATE TABLE customers
    (
      id serial not null primary key,
      name varchar(55) not null,
      code varchar(20) not null,
      address varchar(100),
      is_deleted boolean not null default false,
      updated_at timestamp with time zone default current_timestamp,
      created_at timestamp with time zone default current_timestamp
    );

    CREATE TYPE invoices_status AS ENUM ('pending', 'partial','completed');

    CREATE TABLE invoices
    (
      id serial not null primary key,
      customerId int,
      invoice_no varchar(55) not null,
      total_amount int,
      charge int,
      fine int,
      discount int,
      total_order int,
      total_order_converted int,
      tax int,
      status invoices_status not null default 'pending',
      updated_at timestamp with time zone default current_timestamp,
      created_at timestamp with time zone default current_timestamp
    );

    CREATE TABLE payment_methods
    (
      id serial not null primary key,
      name varchar(55) not null,
      updated_at timestamp with time zone default current_timestamp,
      created_at timestamp with time zone default current_timestamp
    );
    
    CREATE TABLE product_units
    (
        id serial not null primary key,
        productId int not null,
        name varchar(55) not null,
        conversion_to_kg decimal(10,2) not null,
        updated_at timestamp with time zone default current_timestamp,
        created_at timestamp with time zone default current_timestamp
    );
    
    CREATE TABLE products
    (
        id serial not null primary key,
        name varchar(55) not null,
        price int not null,
        qty decimal(10,2) not null,
        "desc" varchar(255) not null,
        is_deleted boolean not null default false,
        updated_at timestamp with time zone default current_timestamp,
        created_at timestamp with time zone default current_timestamp
    );

    CREATE TABLE spb
    (
        id serial not null primary key,
        customerId int,
        invoiceId int,
        no_plat varchar(10) not null,
        clock_out timestamp with time zone not null,
        "desc" varchar(255),
        updated_at timestamp with time zone default current_timestamp,
        created_at timestamp with time zone default current_timestamp
    );

    CREATE TABLE transaction_in_header
    (
        id serial not null primary key,
        customerId int not null,
        code varchar(55),
        "desc" varchar(255),
        updated_at timestamp with time zone default current_timestamp,
        created_at timestamp with time zone default current_timestamp
    );

    CREATE TABLE transaction_ins
    (
        id serial not null primary key,
        customerId int not null,
        productId int not null,
        transaction_in_headerId int not null,
        qty int not null,
        converted_qty decimal(10,2) not null default 0,
        remaining_qty int not null default 0,
        final_qty int not null default 0,
        unit varchar(55) not null,
        conversion_to_kg decimal(10,2) not null,
        is_charge boolean not null default false,
        updated_at timestamp with time zone default current_timestamp,
        created_at timestamp with time zone default current_timestamp
    );

    CREATE TABLE transaction_outs
    (
        id serial not null primary key,
        productId int,
        productName varchar(55),
        customerId int,
        transaction_inId int,
        invoiceId int,
        spbId int,
        qty int not null,
        converted_qty decimal(10,2) not null,
        conversion_to_kg decimal(10,2) not null,
        unit varchar(55) not null,
        total_price int not null,
        total_fine int not null,
        total_charge int not null,
        is_charge boolean not null default false,
        price int not null,
        total_days int not null,
        updated_at timestamp with time zone default current_timestamp,
        created_at timestamp with time zone default current_timestamp
    );

    CREATE TYPE user_role AS ENUM ('superadmin','admin','default');


    CREATE TABLE user_roles
    (
        id serial not null primary key,
        userId int not null,
        role user_role not null default 'default',
        updated_at timestamp with time zone default current_timestamp,
        created_at timestamp with time zone default current_timestamp
    );

    CREATE TABLE users
    (
        id serial not null primary key,
        fullname varchar(55) not null,
        email varchar(55) unique not null,
        password varchar(55) not null,
        is_deleted boolean not null default 'false',
        updated_at timestamp with time zone default current_timestamp,
        created_at timestamp with time zone default current_timestamp
    );

    `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    DROP TABLE app_settings;
    DROP TABLE ar;
    DROP TABLE ar_payment;
    DROP TABLE cashflows;
    DROP TABLE charges;
    DROP TABLE customer_payments;
    DROP TABLE customers;
    DROP TABLE invoices;
    DROP TABLE payment_methods;
    DROP TABLE product_units;
    DROP TABLE products;
    DROP TABLE spb;
    DROP TABLE transaction_in_header;
    DROP TABLE transaction_ins;
    DROP TABLE transaction_outs;
    DROP TABLE user_roles;
    DROP TABLE users;
    DROP TYPE order_status;
    DROP TYPE cashflow_type;
    DROP TYPE cashflow_from;
    DROP TYPE charges_type;
    DROP TYPE invoices_status;
    DROP TYPE user_role;
    `);
}
