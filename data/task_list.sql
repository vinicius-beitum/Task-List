CREATE DATABASE task_list_db;

USE task_list_db;

CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(10) NOT NULL UNIQUE,
);