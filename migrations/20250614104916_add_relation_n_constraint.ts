import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE ar
    ADD CONSTRAINT fk_ar_customers foreign key (customerId) references customers (id),
    ADD CONSTRAINT fk_ar_invoice foreign key (invoiceId) references invoices (id);

    ALTER TABLE ar_payment
    ADD CONSTRAINT fk_ar_payment_customer foreign key (customerId) references customers (id),
    ADD CONSTRAINT fk_ar_payment_ar foreign key (arId) references ar (id),
    ADD CONSTRAINT fk_ar_payment_customer_payment foreign key (customer_paymentId) references payment_methods (id);

    ALTER TABLE cashflows
    ADD CONSTRAINT fk_cashflow_user foreign key (created_byId) references users (id);

    ALTER TABLE customer_payments
    ADD CONSTRAINT fk_customer_payments_paymentmet foreign key (payment_methodId) references payment_methods (id),
    ADD CONSTRAINT fk_customer_payments_customer foreign key (customerId) references customers (id);

    ALTER TABLE invoices
    ADD CONSTRAINT fk_invoices_customer foreign key (customerId) references customers (id);

    ALTER TABLE product_units
    ADD CONSTRAINT fk_prod_units_product foreign key (productId) references products (id);

    ALTER TABLE spb
    ADD CONSTRAINT fk_spb_customer foreign key (customerId) references customers (id),
    ADD CONSTRAINT fk_spb_invoice foreign key (invoiceId) references invoices (id),
    ADD CONSTRAINT unique_invoice UNIQUE(invoiceId);
    
    ALTER TABLE transaction_in_header
    ADD CONSTRAINT fk_trans_in_header_customer foreign key (customerId) references customers (id);

    ALTER TABLE transaction_ins
    ADD CONSTRAINT fk_trans_in_customer foreign key (customerId) references customers (id),
    ADD CONSTRAINT fk_trans_in_transheader foreign key (transaction_in_headerId) references transaction_in_header (id),
    ADD CONSTRAINT fk_trans_in_product foreign key (productId) references products (id);

    ALTER TABLE transaction_outs
    ADD CONSTRAINT fk_trans_out_product foreign key (productId) references products (id),
    ADD CONSTRAINT fk_trans_out_customer foreign key (customerId) references customers (id),
    ADD CONSTRAINT fk_trans_out_invoice foreign key (invoiceId) references invoices (id),
    ADD CONSTRAINT fk_trans_out_transin foreign key (transaction_inId) references transaction_ins (id),
    ADD CONSTRAINT fk_trans_out_spb foreign key (spbId) references spb (id);

    ALTER TABLE user_roles
    ADD CONSTRAINT fk_user_role_users foreign key (userId) references users (id),
    ADD CONSTRAINT unique_user_role UNIQUE (userId,role);
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
    ALTER TABLE ar
    DROP CONSTRAINT fk_ar_customers,
    DROP CONSTRAINT fk_ar_invoice;

    ALTER TABLE ar_payment
    DROP CONSTRAINT fk_ar_payment_customer,
    DROP CONSTRAINT fk_ar_payment_ar,
    DROP CONSTRAINT fk_ar_payment_customer_payment;

    ALTER TABLE cashflows
    DROP CONSTRAINT fk_cashflow_user;

    ALTER TABLE customer_payments
    DROP CONSTRAINT fk_customer_payments_paymentmet,
    DROP CONSTRAINT fk_customer_payments_customer;

    ALTER TABLE invoices
    DROP CONSTRAINT fk_invoices_customer;

    ALTER TABLE product_units
    DROP CONSTRAINT fk_prod_units_product;

    ALTER TABLE spb
    DROP CONSTRAINT fk_spb_customer,
    DROP CONSTRAINT fk_spb_invoice,
    DROP CONSTRAINT unique_invoice;
    
    ALTER TABLE transaction_in_header
    DROP CONSTRAINT fk_trans_in_header_customer;

    ALTER TABLE transaction_ins
    DROP CONSTRAINT fk_trans_in_customer,
    DROP CONSTRAINT fk_trans_in_transheader,
    DROP CONSTRAINT fk_trans_in_product;

    ALTER TABLE transaction_outs
    DROP CONSTRAINT fk_trans_out_product,
    DROP CONSTRAINT fk_trans_out_customer,
    DROP CONSTRAINT fk_trans_out_invoice,
    DROP CONSTRAINT fk_trans_out_transin,
    DROP CONSTRAINT fk_trans_out_spb;

    ALTER TABLE user_roles
    DROP CONSTRAINT fk_user_role_users,
    DROP CONSTRAINT unique_user_role;    
  `);
}
