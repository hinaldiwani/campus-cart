-- Create MySQL user and grant permissions for CampusCart
-- Run: mysql -u root -p < database/create-user.sql

-- Create user 'hinal' with password 'hinal'
CREATE USER IF NOT EXISTS 'hinal'@'localhost' IDENTIFIED BY 'hinal';

-- Grant all privileges on campuscart database
GRANT ALL PRIVILEGES ON campuscart.* TO 'hinal'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Confirm
SELECT User, Host FROM mysql.user WHERE User = 'hinal';
