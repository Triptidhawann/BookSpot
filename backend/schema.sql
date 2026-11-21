-- Run once against the Aiven MySQL database before starting the API.
-- These tables and column names match the SQL queries in server.js.

CREATE TABLE IF NOT EXISTS students (
    roll_no VARCHAR(64) NOT NULL,
    name VARCHAR(120) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (roll_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seats (
    seatNo VARCHAR(16) NOT NULL,
    zone VARCHAR(64) NOT NULL,
    isBooked VARCHAR(16) NOT NULL DEFAULT 'available',
    PRIMARY KEY (seatNo),
    KEY idx_seats_zone (zone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Start every seat as available; existing rows are left untouched on re-runs.
INSERT IGNORE INTO seats (seatNo, zone) VALUES
('A01','A'),('A02','A'),('A03','A'),('A04','A'),('A05','A'),('A06','A'),('A07','A'),('A08','A'),('A09','A'),('A10','A'),('A11','A'),('A12','A'),('A13','A'),('A14','A'),('A15','A'),('A16','A'),
('B01','B'),('B02','B'),('B03','B'),('B04','B'),('B05','B'),('B06','B'),('B07','B'),('B08','B'),('B09','B'),('B10','B'),('B11','B'),('B12','B'),('B13','B'),('B14','B'),('B15','B'),('B16','B'),('B17','B'),('B18','B'),('B19','B'),('B20','B'),('B21','B'),('B22','B'),('B23','B'),('B24','B'),('B25','B'),('B26','B'),('B27','B'),('B28','B'),('B29','B'),('B30','B'),('B31','B'),('B32','B'),
('C01','C'),('C02','C'),('C03','C'),('C04','C'),('C05','C'),('C06','C'),('C07','C'),('C08','C'),('C09','C'),('C10','C'),('C11','C'),('C12','C'),('C13','C'),('C14','C'),
('E01','E'),('E02','E'),('E03','E'),('E04','E'),('E05','E'),('E06','E'),('E07','E'),('E08','E'),('E09','E'),('E10','E'),('E11','E'),('E12','E'),
('F01','F'),('F02','F'),('F03','F'),('F04','F'),('F05','F'),('F06','F'),('F07','F'),('F08','F'),('F09','F'),('F10','F'),('F11','F'),('F12','F');

CREATE TABLE IF NOT EXISTS bookings (
    booking_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    seatNo VARCHAR(16) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    name VARCHAR(120) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'CONFIRMED',
    checkin_token_hash CHAR(64) NULL,
    token_expires_at DATETIME NULL,
    check_in_time DATETIME NULL,
    check_out_time DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (booking_id),
    UNIQUE KEY uq_bookings_checkin_token_hash (checkin_token_hash),
    KEY idx_bookings_student_status (student_id, status),
    KEY idx_bookings_seat_status (seatNo, status),
    CONSTRAINT fk_bookings_student FOREIGN KEY (student_id)
        REFERENCES students (roll_no),
    CONSTRAINT fk_bookings_seat FOREIGN KEY (seatNo)
        REFERENCES seats (seatNo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
