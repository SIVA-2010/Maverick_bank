-- ============================================================
-- Maverick Bank — Database Seed Data
-- ============================================================

USE maverick_bank;

-- ─── Bank Branches ────────────────────────────────────────
INSERT INTO bank_branches (bank_name, branch_name, ifsc_code, address, city, state) VALUES
('State Bank of India', 'Anna Nagar Branch', 'SBIN0001234', '14, Anna Nagar Main Road', 'Chennai', 'Tamil Nadu'),
('State Bank of India', 'T Nagar Branch', 'SBIN0001235', '22, Pondy Bazaar, T Nagar', 'Chennai', 'Tamil Nadu'),
('State Bank of India', 'Adyar Branch', 'SBIN0001236', '5, Gandhi Nagar, Adyar', 'Chennai', 'Tamil Nadu'),
('HDFC Bank', 'Nungambakkam Branch', 'HDFC0001100', '45, Nungambakkam High Road', 'Chennai', 'Tamil Nadu'),
('HDFC Bank', 'Velachery Branch', 'HDFC0001101', '12, Velachery Main Road', 'Chennai', 'Tamil Nadu'),
('HDFC Bank', 'OMR Branch', 'HDFC0001102', '78, Old Mahabalipuram Road, Sholinganallur', 'Chennai', 'Tamil Nadu'),
('ICICI Bank', 'Egmore Branch', 'ICIC0000500', '19, Commander-in-Chief Road, Egmore', 'Chennai', 'Tamil Nadu'),
('ICICI Bank', 'Mylapore Branch', 'ICIC0000501', '31, Dr. Radhakrishnan Salai, Mylapore', 'Chennai', 'Tamil Nadu'),
('Axis Bank', 'Tambaram Branch', 'UTIB0000900', '8, Station Road, Tambaram', 'Chennai', 'Tamil Nadu'),
('Axis Bank', 'Chromepet Branch', 'UTIB0000901', '55, GST Road, Chromepet', 'Chennai', 'Tamil Nadu'),
('Kotak Mahindra Bank', 'Vadapalani Branch', 'KKBK0001200', '10, Arcot Road, Vadapalani', 'Chennai', 'Tamil Nadu'),
('Maverick Bank', 'Main Branch', 'MAVK0000001', '1, Banking Street, Fort Area', 'Chennai', 'Tamil Nadu'),
('Maverick Bank', 'North Branch', 'MAVK0000002', '88, North Usman Road', 'Chennai', 'Tamil Nadu');

-- ─── Loan Products ────────────────────────────────────────
INSERT INTO loan_products (loan_name, loan_type, minimum_amount, maximum_amount, interest_rate, min_tenure_months, max_tenure_months, description, is_active) VALUES
('Home Purchase Loan', 'HOME', 500000.00, 10000000.00, 8.50, 60, 360, 'Finance your dream home with competitive interest rates and flexible repayment options.', true),
('Personal Loan', 'PERSONAL', 50000.00, 1000000.00, 12.50, 12, 60, 'Quick personal loans for medical emergencies, travel, weddings, and more.', true),
('Education Loan', 'EDUCATION', 100000.00, 2000000.00, 9.00, 12, 84, 'Invest in education with our student-friendly loan programs for domestic and international studies.', true),
('Vehicle Loan', 'VEHICLE', 100000.00, 3000000.00, 10.50, 12, 84, 'Drive your dream car with easy EMIs and minimal documentation.', true),
('Business Loan', 'BUSINESS', 200000.00, 5000000.00, 14.00, 12, 60, 'Fuel your business growth with our flexible business financing solutions.', true);

-- ─── Admin User (password: Admin@1234) ────────────────────
-- BCrypt hash of "Admin@1234"
INSERT INTO users (email, password, first_name, last_name, phone_number, address, role, status, created_at, updated_at)
VALUES (
  'admin@maverickbank.com',
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTvCqn5pBs2',
  'Super', 'Admin', '9000000000', '1, Banking Street, Chennai',
  'ADMIN', 'ACTIVE', NOW(), NOW()
);

-- ─── Sample Employee (password: Employee@1234) ────────────
INSERT INTO users (email, password, first_name, last_name, phone_number, address, role, status, created_at, updated_at)
VALUES (
  'employee@maverickbank.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Ravi', 'Kumar', '9000000001', '10, Park Road, Chennai',
  'BANK_EMPLOYEE', 'ACTIVE', NOW(), NOW()
);
