-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-07-2025 a las 20:48:43
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
-- Estructura de tabla para la tabla `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id_refresh_token` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `token_hash_refresh_token` text NOT NULL,
  `expires_at_refresh_token` datetime NOT NULL,
  `user_agent_refresh_token` varchar(500) DEFAULT NULL,
  `ip_address_refresh_token` varchar(45) DEFAULT NULL,
  `is_revoked_refresh_token` tinyint(1) DEFAULT 0,
  `created_at_refresh_token` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at_refresh_token` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id_refresh_token`, `id_user`, `token_hash_refresh_token`, `expires_at_refresh_token`, `user_agent_refresh_token`, `ip_address_refresh_token`, `is_revoked_refresh_token`, `created_at_refresh_token`, `updated_at_refresh_token`) VALUES
(1, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxMjcwMjYsImV4cCI6MTc1MjIxMzQyNn0.i4CsiKtECLp57c_oQlbID7QN7KSyzSb7NFKmcR_7jR4', '2025-07-11 00:57:06', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 0, '2025-07-10 05:57:06', '2025-07-10 05:57:06'),
(2, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxMjcyMzksImV4cCI6MTc1MjIxMzYzOX0.DiM8mIjFCRlCy9hT7Gye3szQH_rM1ACvdDqBTvf1CWc', '2025-07-11 01:00:39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 0, '2025-07-10 06:00:39', '2025-07-10 06:00:39'),
(3, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxMjc1OTIsImV4cCI6MTc1MjIxMzk5Mn0.mTDV2RGf63ZO4p-MRjbUU7HqFPEu_ZaXyoIPhPF33DI', '2025-07-11 01:06:32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 0, '2025-07-10 06:06:32', '2025-07-10 06:06:32'),
(4, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxMjc4MzIsImV4cCI6MTc1MjIxNDIzMn0._RXRNK_nFMH2aSriN0B256OoMkXZTSLwDya8emfijHQ', '2025-07-11 01:10:32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 0, '2025-07-10 06:10:32', '2025-07-10 06:10:32'),
(5, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxMjk3MDcsImV4cCI6MTc1MjIxNjEwN30.JjDKWklfgMcNDFgPPvlR_jEN-vAYHOjkqsJDLZyjPGI', '2025-07-11 01:41:47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 0, '2025-07-10 06:41:47', '2025-07-10 06:41:47'),
(6, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxMjk3ODMsImV4cCI6MTc1MjIxNjE4M30.DN_wBSHIe4Ch_UzBSvYKKpWKMESHdzPvzTpOG0tSDwA', '2025-07-11 01:43:03', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 0, '2025-07-10 06:43:03', '2025-07-10 06:43:03'),
(7, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxNjE5NDUsImV4cCI6MTc1MjI0ODM0NX0.nnqx6EWcHYSmrRogTxch6wf_4pcR8GSFFt05ImaTtYE', '2025-07-11 10:39:05', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 1, '2025-07-10 15:39:05', '2025-07-10 15:41:12'),
(8, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxNjIwODksImV4cCI6MTc1MjI0ODQ4OX0.muplC4xQAkZm7hIP5G095woOEj6g3XVpnVN9DqYNdxE', '2025-07-11 10:41:29', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 1, '2025-07-10 15:41:29', '2025-07-10 15:41:45'),
(9, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxNjQ2MTIsImV4cCI6MTc1MjI1MTAxMn0.MvJOGFtXfsOAXeCTOMYMBb2Ic0Vsw_HU3Lb66gRQXjk', '2025-07-11 11:23:32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 1, '2025-07-10 16:23:32', '2025-07-10 16:39:58'),
(10, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxNjU2NTMsImV4cCI6MTc1MjI1MjA1M30.YOjfEKnA0fEVTaIDzQiRMYG6YYdrQfheNQyNmB6J1K0', '2025-07-11 11:40:53', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 1, '2025-07-10 16:40:53', '2025-07-10 18:40:14'),
(11, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxNzI4NTYsImV4cCI6MTc1MjI1OTI1Nn0.9PhigYR6EaDlMXgfkCNYZqfqjz930BORgRQxLeJXnWI', '2025-07-11 13:40:56', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 1, '2025-07-10 18:40:56', '2025-07-10 18:41:12'),
(12, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjo0LCJpYXQiOjE3NTIxNzI5MDYsImV4cCI6MTc1MjI1OTMwNn0.5zro3e9RwxrqvXeiDtMGj3vyxg_Pz4TS-yNBQdwJ5DQ', '2025-07-11 13:41:46', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 1, '2025-07-10 18:41:46', '2025-07-10 18:42:15'),
(13, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxNzI5NDAsImV4cCI6MTc1MjI1OTM0MH0.hTCLz-8VoiqT1YLTrPxMvdH_xlbksnnLovhdop6T5dk', '2025-07-11 13:42:20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 1, '2025-07-10 18:42:20', '2025-07-10 18:42:48'),
(14, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjo0LCJpYXQiOjE3NTIxNzI5NzksImV4cCI6MTc1MjI1OTM3OX0.tUWfJUyzWshOQrGaWFDnIwsTT98N-XLJxK-D378w17k', '2025-07-11 13:42:59', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 1, '2025-07-10 18:42:59', '2025-07-10 18:43:09'),
(15, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjo0LCJpYXQiOjE3NTIxNzMwMTMsImV4cCI6MTc1MjI1OTQxM30.DdZ-3jU_zkd7CGhhlaPbUXJl3Y0ORyiGBRcCrlqUnwo', '2025-07-11 13:43:33', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 1, '2025-07-10 18:43:33', '2025-07-10 18:44:10'),
(16, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjozLCJpYXQiOjE3NTIxNzMwNTUsImV4cCI6MTc1MjI1OTQ1NX0._tieUdq2uv-AH8YZJRCHXCA6c975Sb4kMty9tt9ubGQ', '2025-07-11 13:44:15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 1, '2025-07-10 18:44:15', '2025-07-10 18:45:51'),
(17, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjo0LCJpYXQiOjE3NTIxNzMxNjMsImV4cCI6MTc1MjI1OTU2M30.A1i0-9TUO_fsQO3bdUisgKpZ2s_mvr1EsnnCQenpU-Y', '2025-07-11 13:46:03', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', 0, '2025-07-10 18:46:03', '2025-07-10 18:46:03');

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
(3, 'quintiagogarciadev', 'quintiagogarciadev@gmail.com', '$2b$10$shv3cEpoNCwniSQ5SRukoO6TKSUOdOG5gPS6xRsnQLSGka5kZS/m6', 'admin', 'active', '2025-07-08 04:37:28'),
(4, 'santiago', 'santiago@gmail.com', '$2b$10$6g6t4BxZrAZ7dJkmAWxDTebnJ4VFd7In0u7YL1jEF0B1NDRyPmInS', 'user', 'active', '2025-07-10 18:41:46');

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
-- Indices de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id_refresh_token`),
  ADD KEY `idx_id_user` (`id_user`),
  ADD KEY `idx_expires_at_refresh_token` (`expires_at_refresh_token`);

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
-- AUTO_INCREMENT de la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id_refresh_token` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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

--
-- Filtros para la tabla `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
