INSERT  INTO tenants (
    name,
    slug
)
VALUES               ('Acme Insurance', 'acme');

INSERT  INTO tenants (
    name,
    slug
)
VALUES               ('Big Corp Assurance', 'bigcorp');

INSERT  INTO tenants (
    name,
    slug
)
VALUES               ('Tiny Mutual', 'tiny-mutual');

INSERT  INTO users (
    email,
    password_hash,
    name,
    tenant_id,
    role
)
VALUES             ('alice@acme.com', '$2b$10$HIoZM/i2ltCV2jyRimKALOUWBecAup6ocwNDfpMl7WP710ySYUFo6', 'Alice Anderson', 1, 'owner');

INSERT  INTO users (
    email,
    password_hash,
    name,
    tenant_id,
    role
)
VALUES             ('bob@acme.com', '$2b$10$HIoZM/i2ltCV2jyRimKALOUWBecAup6ocwNDfpMl7WP710ySYUFo6', 'Bob Brown', 1, 'member');

INSERT  INTO users (
    email,
    password_hash,
    name,
    tenant_id,
    role
)
VALUES             ('frank@acme.com', '$2b$10$HIoZM/i2ltCV2jyRimKALOUWBecAup6ocwNDfpMl7WP710ySYUFo6', 'Frank Foster', 1, 'admin');

INSERT  INTO users (
    email,
    password_hash,
    name,
    tenant_id,
    role
)
VALUES             ('carol@bigcorp.com', '$2b$10$HIoZM/i2ltCV2jyRimKALOUWBecAup6ocwNDfpMl7WP710ySYUFo6', 'Carol Chen', 2, 'owner');

INSERT  INTO users (
    email,
    password_hash,
    name,
    tenant_id,
    role
)
VALUES             ('dave@bigcorp.com', '$2b$10$HIoZM/i2ltCV2jyRimKALOUWBecAup6ocwNDfpMl7WP710ySYUFo6', 'Dave Davis', 2, 'member');

INSERT  INTO users (
    email,
    password_hash,
    name,
    tenant_id,
    role
)
VALUES             ('tom@tiny-mutual.com', '$2b$10$HIoZM/i2ltCV2jyRimKALOUWBecAup6ocwNDfpMl7WP710ySYUFo6', 'Tom Taylor', 3, 'owner');

INSERT  INTO customers (
    tenant_id,
    name,
    email,
    phone
)
VALUES                 (1, 'John Smith', 'john@example.com', '555-0101');

INSERT  INTO customers (
    tenant_id,
    name,
    email,
    phone
)
VALUES                 (1, 'Jane Doe', 'jane@example.com', '555-0102');

INSERT  INTO customers (
    tenant_id,
    name,
    email,
    phone
)
VALUES                 (1, 'Michael Brown', 'michael@example.com', '555-0103');

INSERT  INTO customers (
    tenant_id,
    name,
    email,
    phone
)
VALUES                 (1, 'Sarah Wilson', 'sarah@example.com', '555-0104');

INSERT  INTO customers (
    tenant_id,
    name,
    email,
    phone
)
VALUES                 (2, 'Bob Johnson', 'bob.j@example.com', '555-0201');

INSERT  INTO customers (
    tenant_id,
    name,
    email,
    phone
)
VALUES                 (2, 'Mary Williams', 'mary@example.com', '555-0202');

INSERT  INTO customers (
    tenant_id,
    name,
    email,
    phone
)
VALUES                 (2, 'David Garcia', 'david@example.com', '555-0203');

INSERT  INTO customers (
    tenant_id,
    name,
    email,
    phone
)
VALUES                 (2, 'Linda Martinez', 'linda@example.com', '555-0204');

INSERT  INTO customers (
    tenant_id,
    name,
    email,
    phone
)
VALUES                 (3, 'Tom Davis', 'tom.d@example.com', '555-0301');

INSERT  INTO customers (
    tenant_id,
    name,
    email,
    phone
)
VALUES                 (3, 'Nancy Taylor', 'nancy@example.com', '555-0302');

INSERT  INTO policies (
    tenant_id,
    customer_id,
    policy_number,
    premium,
    start_date,
    end_date
)
VALUES                (1, 1, 'P-001', 12000, '2026-01-01', '2027-01-01');

INSERT  INTO policies (
    tenant_id,
    customer_id,
    policy_number,
    premium,
    start_date,
    end_date
)
VALUES                (1, 2, 'P-002', 18000, '2026-02-01', '2027-02-01');

INSERT  INTO policies (
    tenant_id,
    customer_id,
    policy_number,
    premium,
    start_date,
    end_date
)
VALUES                (1, 3, 'P-003', 24000, '2026-03-01', '2027-03-01');

INSERT  INTO policies (
    tenant_id,
    customer_id,
    policy_number,
    premium,
    start_date,
    end_date
)
VALUES                (1, 4, 'P-004', 15000, '2026-04-01', '2027-04-01');

INSERT  INTO policies (
    tenant_id,
    customer_id,
    policy_number,
    premium,
    start_date,
    end_date
)
VALUES                (2, 5, 'P-001', 45000, '2026-01-15', '2027-01-15');

INSERT  INTO policies (
    tenant_id,
    customer_id,
    policy_number,
    premium,
    start_date,
    end_date
)
VALUES                (2, 6, 'P-002', 62000, '2026-03-01', '2027-03-01');

INSERT  INTO policies (
    tenant_id,
    customer_id,
    policy_number,
    premium,
    start_date,
    end_date
)
VALUES                (2, 7, 'P-003', 38000, '2026-05-01', '2027-05-01');

INSERT  INTO policies (
    tenant_id,
    customer_id,
    policy_number,
    premium,
    start_date,
    end_date
)
VALUES                (2, 8, 'P-004', 55000, '2026-06-01', '2027-06-01');

INSERT  INTO policies (
    tenant_id,
    customer_id,
    policy_number,
    premium,
    start_date,
    end_date
)
VALUES                (3, 9, 'P-001', 8000, '2026-04-01', '2027-04-01');

INSERT  INTO policies (
    tenant_id,
    customer_id,
    policy_number,
    premium,
    start_date,
    end_date
)
VALUES                (3, 10, 'P-002', 9000, '2026-05-01', '2027-05-01');