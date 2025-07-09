-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-07-2025 a las 21:25:33
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cloudsyncpro_db_react`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `files`
--

CREATE TABLE `files` (
  `id_file` int(11) NOT NULL,
  `name_file` varchar(255) NOT NULL,
  `url_file` text NOT NULL,
  `type_file` varchar(50) DEFAULT NULL,
  `folder_id` int(11) NOT NULL,
  `owner_user_id` int(11) NOT NULL,
  `created_at_file` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `folders`
--

CREATE TABLE `folders` (
  `id_folder` int(11) NOT NULL,
  `name_folder` varchar(100) NOT NULL,
  `parent_folder_id` int(11) DEFAULT NULL,
  `owner_user_id` int(11) NOT NULL,
  `created_at_folder` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `name_user` varchar(100) NOT NULL,
  `email_user` varchar(150) NOT NULL,
  `password_user` varchar(255) NOT NULL,
  `role_user` enum('admin','user') DEFAULT 'user',
  `status_user` enum('active','banned','inactive') DEFAULT 'active',
  `created_at_user` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id_user`, `name_user`, `email_user`, `password_user`, `role_user`, `status_user`, `created_at_user`) VALUES
(1, 'Santiago Quintero', 'quintero@example.com', '$2b$10$1ilkRdEKRSs0b1Q/MUD5n.sm3t5DjDnVzNyOXpFSfjHXrTMHTr8s2', 'user', 'active', '2025-07-08 00:55:59'),
(2, 'quintiagogarciadev1', 'quintiagogarciadev1@gmail.com', '$2b$10$1rfRYd4Ic34ZVtoWxwJfUOfkaMpz8PZav135qQ4KIc.E2DmKMoWGm', 'user', 'active', '2025-07-08 04:31:30'),
(3, 'quintiagogarciadev', 'quintiagogarciadev@gmail.com', '$2b$10$shv3cEpoNCwniSQ5SRukoO6TKSUOdOG5gPS6xRsnQLSGka5kZS/m6', 'user', 'active', '2025-07-08 04:37:28');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id_file`),
  ADD KEY `folder_id` (`folder_id`),
  ADD KEY `owner_user_id` (`owner_user_id`);

--
-- Indices de la tabla `folders`
--
ALTER TABLE `folders`
  ADD PRIMARY KEY (`id_folder`),
  ADD KEY `owner_user_id` (`owner_user_id`),
  ADD KEY `parent_folder_id` (`parent_folder_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email_user` (`email_user`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `files`
--
ALTER TABLE `files`
  MODIFY `id_file` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `folders`
--
ALTER TABLE `folders`
  MODIFY `id_folder` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `files_ibfk_1` FOREIGN KEY (`folder_id`) REFERENCES `folders` (`id_folder`),
  ADD CONSTRAINT `files_ibfk_2` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id_user`);

--
-- Filtros para la tabla `folders`
--
ALTER TABLE `folders`
  ADD CONSTRAINT `folders_ibfk_1` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id_user`),
  ADD CONSTRAINT `folders_ibfk_2` FOREIGN KEY (`parent_folder_id`) REFERENCES `folders` (`id_folder`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
