-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Jul 02, 2025 at 05:13 AM
-- Server version: 8.0.41
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `training`
--

-- --------------------------------------------------------

--
-- Table structure for table `attachment`
--

CREATE TABLE `attachment` (
  `attachment_id` varchar(36) NOT NULL,
  `report_id` varchar(36) DEFAULT NULL,
  `status_delete` tinyint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attachment`
--

INSERT INTO `attachment` (`attachment_id`, `report_id`, `status_delete`, `created_at`) VALUES
('0197b16c-8c88-7772-9eab-ab1d3ca143f6', '0197b069-80d1-7285-8940-f8c6ed09ed51', 1, '2025-06-27 12:46:10'),
('0197b16c-8ccb-7796-9403-6f72c0339495', '0197b069-80d1-7285-8940-f8c6ed09ed51', 1, '2025-06-27 12:46:10');

-- --------------------------------------------------------

--
-- Table structure for table `meeting`
--

CREATE TABLE `meeting` (
  `meeting_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `training_sesi_id` varchar(36) NOT NULL,
  `name` varchar(64) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meeting`
--

INSERT INTO `meeting` (`meeting_id`, `training_sesi_id`, `name`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
('01972412-1b48-70a9-b48b-cf4f357d2ba7', '019710c3-65a0-7489-9e95-439f3ef34561', 'Pertemuan 1', '2025-05-06 01:00:00', '2025-05-06 02:00:00', '2025-05-31 02:00:55', '2025-06-05 01:56:10'),
('019735ba-8da1-7025-86a6-3237d95b3e33', '019710c3-65a0-7489-9e95-439f3ef34561', 'Pertemuan 2', '2025-06-03 12:18:00', '2025-06-03 13:18:00', '2025-06-03 12:18:27', '2025-06-05 01:56:16'),
('019735ba-df2c-70f0-8ff7-c80158ee825b', '019710c3-65a0-7489-9e95-439f3ef34561', 'Pertemuan 3', '2025-06-11 12:18:00', '2025-06-11 14:18:00', '2025-06-03 12:18:48', '2025-06-27 01:41:41'),
('0197460d-42d1-721b-a1d9-92c9602a2311', '01973d8b-9d66-775e-a6d9-b66654110be2', 'Pertemuan 1', '2025-06-05 16:28:00', '2025-06-05 16:29:00', '2025-06-06 16:22:43', '2025-06-27 01:41:03');

-- --------------------------------------------------------

--
-- Table structure for table `otp_verify`
--

CREATE TABLE `otp_verify` (
  `id_otp` varchar(36) NOT NULL,
  `staff_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `otp` varchar(64) NOT NULL,
  `status` tinyint NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `otp_verify`
--

INSERT INTO `otp_verify` (`id_otp`, `staff_id`, `otp`, `status`, `created_at`, `updated_at`) VALUES
('01975ae0-1ee6-754d-bb65-49ce142ea517', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$mManJCNUcvRVFrB4ZHuqz.R5324wBAiqGhCSZ7g7cH2efsXfD1Diq', 1, '2025-06-10 17:25:26', '2025-06-10 17:25:26'),
('01975ae6-5ab0-7339-97c3-9c4a69c161bb', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$7yjg5g1sAsTOemAgkksUIu7ZD0qLjG0Nqdpz3rBfDCjGj/Ser2t22', 1, '2025-06-10 17:32:15', '2025-06-10 17:32:15'),
('01975b0b-ccf3-75ff-ada7-0c11a2a2e204', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$14pIJWrUAdXVT08vgCwH1.X3GOE1qtB0nZNWzQOQcZciOJaC6NuIq', 1, '2025-06-10 18:13:09', '2025-06-10 18:13:09'),
('01975b0c-ed44-768b-863d-1b8dcaffdab0', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$nN8/DSNApk6.6jO7fjAudu4VzNm99XAHh4HXaQjj03hiioQ4c7R/K', 1, '2025-06-10 18:14:23', '2025-06-10 18:14:23'),
('01975b13-9193-75cd-b938-609823531304', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$uu8n4kWHEEzIQmQFSgoYK.sYxNbOSP7g5RCl2CeneBAIYaz14VKZW', 1, '2025-06-10 18:21:38', '2025-06-10 18:21:38'),
('01975b1b-3675-74df-9efd-049c28c45eed', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$3/yj2t6m1upwfUo7J3HEx.779Can/yeO.cMc.hZdmsaAdiot1.7q6', 1, '2025-06-10 18:29:59', '2025-06-10 18:29:59'),
('01975b20-b1ad-73bc-842f-ac146ad508ef', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$2EZwTw.Zyg8ronrOG09q1udpKz3b8pIzX/C8WODkKEsAO/.m5d6bC', 1, '2025-06-10 18:35:58', '2025-06-10 18:35:58'),
('01975b34-31d0-75ae-a4dc-1e8e8f1df870', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$GVTBlfjTP8f/u7Rk9wb82.CzbcbQtPmxYP86uo1S3dRcMupu0jsjC', 1, '2025-06-10 18:57:16', '2025-06-10 18:59:48'),
('01975b47-ebe9-7724-ba22-dc94a76a228b', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$w/9Rx30A/CdSPpD0RgdFwOjQx1VWcgRl2XlRZglOjkIL8bWd7eMhm', 1, '2025-06-10 19:18:49', '2025-06-10 19:21:04'),
('01975b81-ab39-7558-b90a-341228d7f90b', '01969a3a-be00-72f9-b5a8-52cfaa23acc7', '$2b$10$VW3GM8XH1yryKRfV6byl4Os44NUxblpXyW1L.FFN3xbfyCzOqVQL6', 1, '2025-06-10 20:21:54', '2025-06-10 20:22:33'),
('01975b87-055b-724f-8765-586bca466e6a', '01969a3a-be00-72f9-b5a8-52cfaa23acc7', '$2b$10$GtuMeg.uTwrO.hGMGez3c.0H/V9wkPGV4vYg.k4OENf8diDjlaaDS', 1, '2025-06-10 20:27:44', '2025-06-10 20:28:19'),
('01975b88-4573-729c-bc2a-e46d14c47973', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$OLGM9BAPgHYOzPWATdfwCufggcF28w/qIhOGkcOkIOhCjCZKEZkkK', 1, '2025-06-10 20:29:06', '2025-06-10 20:30:06'),
('01975b8f-90c7-7514-bd80-04f53362b307', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$vNqNiT0c1/PpTW00VKw6XuDqE2cSQfPpFpZbt6o3puougL5yUw8ly', 1, '2025-06-10 20:37:04', '2025-06-10 20:37:31'),
('01975b95-0a0c-75d7-9a18-0ea46c59cb02', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$PIFNr8psx1z3GXRaHVgr4OLX7jpDzwPi0dG29s5FlBWhXT/8qsH2.', 1, '2025-06-10 20:43:03', '2025-06-10 20:43:23'),
('01975b98-b1c4-75ab-bc32-e982ff1910af', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$FcrWrbA/B3dEM2ljf/jQxe7a3KOTA3WK17CSq6I8Z0Num.fTh4OGS', 1, '2025-06-10 20:47:03', '2025-06-10 20:47:03'),
('01975b9d-7a6b-7599-8f68-b5955b081c04', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$rNVooOqj2mGLxKO8MTlEPOkR7hVfaUyvhVsp9aPTm71tR0Ctfv5Tq', 1, '2025-06-10 20:52:16', '2025-06-10 20:52:43'),
('01975bac-fda2-73ba-bdce-2173ab276be6', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$Rh9J77BKPinqrGMUuQ436egC8cSlGFVWTtqFbDYj/noqH1v3cy3fO', 1, '2025-06-10 21:09:13', '2025-06-10 21:09:40'),
('01975bb1-300d-7567-88cb-6a7088232c8c', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$sKzYKAQapOXUw7AGq3cipeg9qiMmwr5Re/rTFZTAJAwFqTE6qDZ5O', 1, '2025-06-10 21:13:48', '2025-06-10 21:14:10'),
('0197606f-460f-70c8-9a90-3833484e6c01', '0196f2ae-f9fb-73e8-8e45-4fd7a7480906', '$2b$10$vlUF.PMi.l/uSe/iaDS6t.c2LMTyPQPiOPS2kxrLUTIm0LdVg39yK', 1, '2025-06-11 19:19:54', '2025-06-11 19:19:54'),
('0197a393-dee7-7587-96f4-5fd77c8c35da', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$DOma7skydyezJRGqdqIUi.l2zI2O6eACF7qqcHYu7OPWtMCNTmimq', 1, '2025-06-24 20:14:26', '2025-06-24 20:15:01'),
('0197a39a-62e2-7188-a5db-f4581d0effee', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$Wuhe7Dr73yo7dmsT3Uwmv.8IXdbXx0l84Och8c3spIsfmwJUYoedO', 1, '2025-06-24 20:21:33', '2025-06-24 20:21:55'),
('0197a39b-94ba-70ae-b7c8-bf9fc3f550e8', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$YsCQTceE8rm4FqgpDdpdYOmGqtEkzzPjH4lMdGYatfS2a8O8QN7da', 1, '2025-06-24 20:22:51', '2025-06-24 20:23:10'),
('0197a39e-adfb-70b8-9219-891bf8ef4959', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$Z/QQUOPepHBhU40BwGhaC.6KwftUZobBv6Ekha293mgeaOtM1mPUq', 1, '2025-06-24 20:26:14', '2025-06-24 20:26:34'),
('0197a3a6-f669-70ec-8049-bb1da4eb8920', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$Sw2Yzz19OHgfP1BSnkkYuuOg3XeDE5YF94oYBSJfkHXpGA8sNXjge', 1, '2025-06-24 20:35:17', '2025-06-24 20:35:30'),
('0197a3a7-d191-7371-a49e-879eda2760c1', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$ih7VG45n0Op/dX89//xh8OG6hGSNLygJG3T7uZQXgig65uRbPgsZ6', 1, '2025-06-24 20:36:13', '2025-06-24 20:36:28'),
('0197a3a8-b698-7209-afb5-e146b5061198', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$tuROJNQA3m6Fq3kD.etqluLsdxQZWeodgCysiEiwaqYnHCRsjj8uq', 1, '2025-06-24 20:37:12', '2025-06-24 20:37:40'),
('0197a3ab-543f-7232-a5a3-8548d8a19d21', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$9p4tR8LiHBcBssE2ccRKS.SVpMofbAZriJcE8aJooH1DYc.fQysRy', 1, '2025-06-24 20:40:03', '2025-06-24 20:40:24'),
('0197a3ae-367f-769e-b748-27e94ee23cbd', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$evJlmJG7VTqSLJCLs6uDi.i7ZwNGL1t5VcCVhKMGVa3mCSqZoHYiS', 1, '2025-06-24 20:43:12', '2025-06-24 20:43:38'),
('0197a3b4-e9eb-714b-9027-d9b487050560', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$5xdGg7Kx6vZiEdxKxwfUFe5ehjT4RRnkoMSUpmPU5tRMpGgLgwwa6', 1, '2025-06-24 20:50:32', '2025-06-24 20:50:51'),
('0197a3c4-7089-71cc-8576-974cb3e6432e', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$OgljAfxrLX9virxTpoARpOLQF7Dw9SqfODk/BLFZp5hjfmbIxhgLu', 1, '2025-06-24 21:07:29', '2025-06-24 21:07:47'),
('0197a3c5-d45f-7599-a7f7-5d418723c57a', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$viDAJldkvRIL.JE0h896te5GYw3nTGsymvBx/3Fj0BWgVDtuybej2', 1, '2025-06-24 21:09:00', '2025-06-24 21:09:16'),
('0197a3d6-4df7-7662-9131-850c2f8147af', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$2b3.kbBvwjq8dOEs3By.BeMYQDLCVG3rVLlm7DY4chPikRdxBjbBO', 1, '2025-06-24 21:27:00', '2025-06-24 21:27:00'),
('0197a3d8-98c7-73dc-b488-302f23147597', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$WT2ivyRCPTUsEf32vVGZOeWjbLB3epHgHmhWfKKa4ZVGAj7xKjmEq', 1, '2025-06-24 21:29:30', '2025-06-24 21:30:00'),
('0197a3d9-9d61-7194-8fa3-698a792fb203', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$jhznPhZYhANNOlKRuheNG.CFpdUoGZ1bzKT9eDfxQ8xaRR/R3j/36', 1, '2025-06-24 21:30:37', '2025-06-24 21:30:58'),
('0197a482-c0bd-74d9-9995-5a5f88e2d8c2', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$x2iREDQ5CJhWp4FK35vyv.07k0IxzFd6CZnWJf/XXAN83cm9Mx/7q', 1, '2025-06-25 00:35:21', '2025-06-25 00:35:21'),
('0197a483-c542-750a-b5f5-f88d1eec72b6', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$FNL3G6H8e/PRNIMsGXq8IepyLAnndqcTvaxCCOu9XzU8L3tKIWIJq', 1, '2025-06-25 00:36:28', '2025-06-25 00:36:28'),
('0197a4a2-8ca0-700b-8d50-5a33d636c43b', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$Hof4yBQOvwjA6GWx0JmJkOHMgf4XZNgqzpsasQL96DRP9o2TdSnzu', 1, '2025-06-25 01:10:05', '2025-06-25 01:10:38'),
('0197a4a3-7396-716f-8ce7-2e5da1ed9691', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$il7VpGYwA6VGmSDNt53.CurHZjSXQMMtl74md7i0K0s5aajEe/S9G', 1, '2025-06-25 01:11:04', '2025-06-25 01:11:44'),
('0197a4b2-8178-7329-90d6-2738cf84966e', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$4T1lzer3DfAarFca8rTmuOf29PXnqrgBYmHWdxD1oan9oSTLudPxu', 1, '2025-06-25 01:27:31', '2025-06-25 01:28:10'),
('0197a634-51a3-75a9-92c1-64fabdaab9e2', 'ecdfc1bf-282a-11f0-883c-0242ac130003', '$2b$10$hWmhWxPIWgr8hCKfVfD5aehM6EZVq1MQ1JUOhHUdNONiS/DKrlPee', 1, '2025-06-25 08:28:56', '2025-06-25 08:29:39');

-- --------------------------------------------------------

--
-- Table structure for table `participant`
--

CREATE TABLE `participant` (
  `participant_id` varchar(36) NOT NULL,
  `agency` varchar(64) NOT NULL,
  `name` varchar(64) NOT NULL,
  `domicile` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status_deleted` tinyint NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `participant`
--

INSERT INTO `participant` (`participant_id`, `agency`, `name`, `domicile`, `email`, `status_deleted`, `created_at`, `updated_at`) VALUES
('019712bf-fe13-71de-acea-e3f6154f9cc3', 'PT.  Wijaya Gita Utama', 'Shierly', 'Yogyakarta', 'Gading12@gmail.com', 1, '2025-05-28 07:05:18', '2025-06-27 14:35:22'),
('019714a2-b0bd-76ba-a1c6-a8b54e85cfa2', 'PT. Wijaya Gita Utama', 'Herman', 'Sleman', 'basit44@gmail.com', 1, '2025-06-03 14:17:16', '2025-06-27 14:34:31'),
('0197403e-1cda-7600-b2ec-3fa287a33991', 'PERTAMINA LUBRICANTS', 'Arif Wibowo', 'Sleman', 'smk@gmail.com', 1, '2025-06-05 13:18:21', '2025-06-27 14:33:49'),
('01974040-7894-7388-89e7-34a9a53998b0', 'PT. Wijaya Gita Utama', 'Sbastian Maluin', 'Sleman', 'adamin@example.com', 1, '2025-06-05 13:20:56', '2025-06-27 14:36:22');

-- --------------------------------------------------------

--
-- Table structure for table `participant_training`
--

CREATE TABLE `participant_training` (
  `participant_training_id` varchar(36) NOT NULL,
  `participant_id` varchar(36) NOT NULL,
  `training_sesi_id` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `participant_training`
--

INSERT INTO `participant_training` (`participant_training_id`, `participant_id`, `training_sesi_id`, `created_at`) VALUES
('0197b1cf-1911-747a-a7c2-39ffdf0a954f', '0197403e-1cda-7600-b2ec-3fa287a33991', 'a4be103a-3ad5-11f0-8ecd-c64e354874b1', '2025-06-27 14:33:49'),
('0197b1cf-1911-747a-a7c2-3d2643170ee6', '0197403e-1cda-7600-b2ec-3fa287a33991', '01973d8b-9d66-775e-a6d9-b66654110be2', '2025-06-27 14:33:49'),
('0197b1cf-1911-747a-a7c2-4097a1a7fa47', '0197403e-1cda-7600-b2ec-3fa287a33991', '019710c3-65a0-7489-9e95-439f3ef34561', '2025-06-27 14:33:49'),
('0197b1cf-bf15-76d8-a8f0-dabb8d8b2351', '019714a2-b0bd-76ba-a1c6-a8b54e85cfa2', '0197112c-cd91-74ae-afaa-fadd99a83d83', '2025-06-27 14:34:31'),
('0197b1cf-bf15-76d8-a8f0-dc8944996bcd', '019714a2-b0bd-76ba-a1c6-a8b54e85cfa2', '019710c3-65a0-7489-9e95-439f3ef34561', '2025-06-27 14:34:31'),
('0197b1d0-8786-7399-bac8-1d058a2c005f', '019712bf-fe13-71de-acea-e3f6154f9cc3', '019710c3-65a0-7489-9e95-439f3ef34561', '2025-06-27 14:35:22'),
('0197b1d1-709a-71b7-bac9-2937232e7ca5', '01974040-7894-7388-89e7-34a9a53998b0', '019710c3-65a0-7489-9e95-439f3ef34561', '2025-06-27 14:36:22');

-- --------------------------------------------------------

--
-- Table structure for table `present`
--

CREATE TABLE `present` (
  `present_id` varchar(36) NOT NULL,
  `meeting_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `participant_id` varchar(36) DEFAULT NULL,
  `status_present` enum('hadir','absen','izin') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `present`
--

INSERT INTO `present` (`present_id`, `meeting_id`, `participant_id`, `status_present`, `created_at`) VALUES
('0197b13f-d18d-7356-9131-58bff9f856c9', '01972412-1b48-70a9-b48b-cf4f357d2ba7', '019714a2-b0bd-76ba-a1c6-a8b54e85cfa2', 'hadir', '2025-06-27 11:57:19'),
('0197b13f-d1b0-75dc-9f55-f6729dd3aa1f', '01972412-1b48-70a9-b48b-cf4f357d2ba7', '019712bf-fe13-71de-acea-e3f6154f9cc3', 'hadir', '2025-06-27 11:57:19');

-- --------------------------------------------------------

--
-- Table structure for table `program_training`
--

CREATE TABLE `program_training` (
  `program_training_id` varchar(36) NOT NULL,
  `name` varchar(64) NOT NULL,
  `alias` char(4) NOT NULL,
  `created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_training`
--

INSERT INTO `program_training` (`program_training_id`, `name`, `alias`, `created_at`) VALUES
('1', 'Fullstack Web Programmer', 'FWP', '2025-05-03 16:27:40'),
('2', 'Digital Marketing', 'DGM', '2025-05-03 16:27:40'),
('3', 'Mobile Apps Development', 'MAD', '2025-05-03 16:27:40');

-- --------------------------------------------------------

--
-- Table structure for table `report`
--

CREATE TABLE `report` (
  `report_id` varchar(36) NOT NULL,
  `training_sesi_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `report_schedule_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `staff_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(64) NOT NULL,
  `start_time` datetime NOT NULL,
  `finish_time` datetime NOT NULL,
  `author_acc` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status_acc` enum('menunggu','disetujui','ditolak') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `acc_director_by` varchar(36) NOT NULL,
  `acc_director_status` enum('menunggu','disetujui','ditolak') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status_delete` tinyint NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report`
--

INSERT INTO `report` (`report_id`, `training_sesi_id`, `report_schedule_id`, `staff_id`, `name`, `start_time`, `finish_time`, `author_acc`, `status_acc`, `acc_director_by`, `acc_director_status`, `status_delete`, `created_at`, `updated_at`) VALUES
('0197b069-80d1-7285-8940-f8c6ed09ed51', '019710c3-65a0-7489-9e95-439f3ef34561', '0197aff3-050c-7132-8c8a-31db19dd9c23', '01969a3a-be00-72f9-b5a8-52cfaa23acc7', 'Pendampingan /Retreshment DMS', '2025-06-26 22:53:00', '2025-06-29 22:53:00', 'ecdfc1bf-282a-11f0-883c-0242ac130003', 'disetujui', 'dcb15a9e-2784-11f0-924e-0242ac130003', 'menunggu', 1, '2025-06-27 08:03:14', '2025-06-27 12:45:48');

-- --------------------------------------------------------

--
-- Table structure for table `report_content`
--

CREATE TABLE `report_content` (
  `report_content_id` varchar(36) NOT NULL,
  `report_type_id` varchar(36) NOT NULL,
  `content_name` varchar(64) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report_content`
--

INSERT INTO `report_content` (`report_content_id`, `report_type_id`, `content_name`, `created_at`, `updated_at`) VALUES
('temp_1751003390618', '0197a636-a55b-76aa-aa16-b817d0df3f23', 'Deskripsi', '2025-06-27 05:51:34', '2025-06-27 05:51:34'),
('temp_1751003396045', '0197a636-a55b-76aa-aa16-b817d0df3f23', 'Catatan', '2025-06-27 05:51:34', '2025-06-27 05:51:34');

-- --------------------------------------------------------

--
-- Table structure for table `report_detail`
--

CREATE TABLE `report_detail` (
  `report_detail_id` varchar(36) NOT NULL,
  `report_content_id` varchar(36) NOT NULL,
  `report_id` varchar(36) NOT NULL,
  `content_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report_detail`
--

INSERT INTO `report_detail` (`report_detail_id`, `report_content_id`, `report_id`, `content_text`, `created_at`) VALUES
('0197b069-80d0-728a-ac27-45178e7e6938', 'temp_1751003390618', '0197b069-80d1-7285-8940-f8c6ed09ed51', 'Kegiatan tersebut telah dilaksanakan dengan baik sesuai jadwal yang telah disepakati oleh PT Sinergi Digital\nSolusindo dan pihak PT. Nijaya Gita Utama\nTerlampir nama-nama peserta yang telah mengikuti kegiatan tersebut.\nDemikian Berita Acara kegiatan ini dibuat.', '2025-06-27 12:46:10'),
('0197b069-80d1-7285-8940-f66c3a09f82e', 'temp_1751003396045', '0197b069-80d1-7285-8940-f8c6ed09ed51', '-', '2025-06-27 12:46:10');

-- --------------------------------------------------------

--
-- Table structure for table `report_schedule`
--

CREATE TABLE `report_schedule` (
  `report_schedule_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `training_sesi_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `report_type_id` varchar(36) NOT NULL,
  `meeting_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report_schedule`
--

INSERT INTO `report_schedule` (`report_schedule_id`, `training_sesi_id`, `report_type_id`, `meeting_id`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
('0197aff3-050c-7132-8c8a-31db19dd9c23', '019710c3-65a0-7489-9e95-439f3ef34561', '0197a636-a55b-76aa-aa16-b817d0df3f23', '01972412-1b48-70a9-b48b-cf4f357d2ba7', '2025-06-27 05:53:00', '2025-06-30 05:53:00', '2025-06-27 05:53:48', '2025-06-27 07:25:17');

-- --------------------------------------------------------

--
-- Table structure for table `report_type`
--

CREATE TABLE `report_type` (
  `report_type_id` varchar(36) NOT NULL,
  `name` varchar(64) NOT NULL,
  `created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report_type`
--

INSERT INTO `report_type` (`report_type_id`, `name`, `created_at`) VALUES
('0197a636-a55b-76aa-aa16-b817d0df3f23', 'BERITA ACARA KEGIATAN', '2025-06-25 08:31:28'),
('2', 'Serah Terima Pelatihan', '2025-05-27 02:45:28');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `alias` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `name`, `alias`, `created_at`) VALUES
(1, 'Direktur', 'DR', '2025-03-08 00:00:00'),
(2, 'Manager', 'MN', '2025-03-08 00:00:00'),
(3, 'Supervisor', 'SP', '2025-03-08 00:00:00'),
(4, 'Trainer', 'TR', '2025-03-08 00:00:00'),
(5, 'Admin', 'AM', '2025-05-27 08:37:34');

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `staff_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role_id` int NOT NULL,
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status_deleted` tinyint NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`staff_id`, `role_id`, `username`, `name`, `email`, `password`, `status_deleted`, `created_at`, `updated_at`) VALUES
('01969a3a-be00-72f9-b5a8-52cfaa23acc7', 4, 'jesicha', 'Jesicha', 'warunited26@gmail.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-04 07:37:43', '2025-05-04 07:37:43'),
('0196d021-5629-763c-a33e-5dca4b245871', 4, 'syasya', 'Syasya', 'syasya123@gmail.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-14 18:49:27', '2025-05-14 18:49:27'),
('0196e7c2-e562-7673-8179-7b8cc59eba0f', 4, 'rismoyo', 'trista', 'trista123@gmail.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-19 08:57:11', '2025-05-19 08:57:11'),
('0196ed3e-ee55-7172-bd93-965409d42336', 4, 'rino', 'Rino', 'rino123@gmail.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-20 10:30:46', '2025-05-20 10:30:46'),
('0196f2ae-f9fb-73e8-8e45-4fd7a7480906', 4, 'merfi', 'Merfi', 'merfi@gmail.com', '$2b$10$GPxPyl7uCH1mkhEZq479/uQM6giC4ARCYegejekwMYhoFXETHq5I.', 1, '2025-05-21 11:51:15', '2025-06-10 20:58:00'),
('01970f7e-00fd-73dd-b108-522cf0e92cc4', 4, 'hadi', 'Hadi', 'hadi210@gmail.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-27 02:06:45', '2025-05-27 02:06:45'),
('01970f7e-af89-750d-b406-af1e95bdab26', 4, 'nurul', 'Nurul', 'nurul21@gmail.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-27 02:07:30', '2025-05-27 02:07:30'),
('01970f85-154e-737d-a7ad-7611c747b431', 4, 'gangsar', 'Gangsar', 'gangsar3222@gmail.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-27 02:14:29', '2025-05-27 02:14:29'),
('01970f85-c521-74be-9a26-621c56b86c2b', 4, 'rifky', 'Rifky', 'rifky212@gmail.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-27 02:15:14', '2025-05-27 02:15:14'),
('01970f86-eadf-775e-a1d9-512bbc7bbaf7', 5, 'salma', 'Salma', 'Salma232@gmail.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-27 02:16:29', '2025-05-27 02:16:29'),
('83ccc56c-2785-11f0-924e-0242ac130003', 2, 'fathu', 'Fathu', 'Fathu@gamil.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-02 18:40:22', '2025-05-02 18:40:22'),
('dcb15a9e-2784-11f0-924e-0242ac130003', 1, 'dhealaras', 'Dhea Laras', 'Dhealaras@gmail.com', '$2b$10$w7yvmgig7Sh5DF877iwQre9tKoIGAaVLdyM0kDrRq7ecNjBExYpf.', 1, '2025-05-02 18:38:00', '2025-05-02 18:38:00'),
('ecdfc1bf-282a-11f0-883c-0242ac130003', 3, 'aris', 'Aris', 'ademaulanahidayah3103@gmail.com', '$2b$10$5Ap7iwNHQlThpJ5BNj5qsuX5lhiTfJh8ZbhHkO7FRyWhVLg8aXRNG', 1, '2025-05-02 18:38:00', '2025-06-25 08:29:49');

-- --------------------------------------------------------

--
-- Table structure for table `training_sesi`
--

CREATE TABLE `training_sesi` (
  `training_sesi_id` varchar(36) NOT NULL,
  `program_training_id` varchar(36) NOT NULL,
  `staff_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(64) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `location` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status_active` enum('active','no active','finish') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `meeting_mode` enum('online','offline') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status_deleted` tinyint NOT NULL,
  `created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `training_sesi`
--

INSERT INTO `training_sesi` (`training_sesi_id`, `program_training_id`, `staff_id`, `name`, `start_date`, `end_date`, `location`, `status_active`, `meeting_mode`, `status_deleted`, `created_at`) VALUES
('019710c3-65a0-7489-9e95-439f3ef34561', '1', '01969a3a-be00-72f9-b5a8-52cfaa23acc7', 'Referetsment DMS', '2025-06-02 00:00:00', '2025-08-30 00:00:00', 'PT Sinergi Digital Solusindo', 'active', 'online', 1, '2025-05-27 08:02:10'),
('0197112c-cd91-74ae-afaa-fadd99a83d83', '2', '01969a3a-be00-72f9-b5a8-52cfaa23acc7', 'Kelas Digital Marketinga', '2025-05-27 00:00:00', '2025-07-12 00:00:00', 'jnm', 'active', 'offline', 1, '2025-05-27 09:57:18'),
('01971133-7af6-7431-8f24-4a18ec0995f3', '1', '01970f85-c521-74be-9a26-621c56b86c2b', 'Kelas Digital Marketing I', '2025-05-27 00:00:00', '2025-05-27 00:00:00', 'sdsd', 'finish', 'offline', 1, '2025-05-27 10:04:35'),
('019715c3-b434-77b9-991e-1e5199ea1a04', '1', '01969a3a-be00-72f9-b5a8-52cfaa23acc7', 'Pelatihan Dasar', '2025-02-20 17:11:00', '2025-02-20 17:11:00', 'jnm', 'finish', 'offline', 1, '2025-05-28 07:20:36'),
('01972128-f34a-72ae-bffa-097598efd448', '1', '01969a3a-be00-72f9-b5a8-52cfaa23acc7', 'Web Service', '2025-05-30 00:00:00', '2025-06-20 00:00:00', 'jnm', 'finish', 'online', 1, '2025-05-30 12:27:01'),
('01972131-39b8-75ef-b02f-81b4e3cd9048', '1', '01970f7e-00fd-73dd-b108-522cf0e92cc4', 'asas', '2025-05-30 12:35:00', '2025-05-30 12:35:00', 'asas', 'finish', 'offline', 0, '2025-05-30 12:36:03'),
('01973d8b-9d66-775e-a6d9-b66654110be2', '1', '01969a3a-be00-72f9-b5a8-52cfaa23acc7', 'Kelas Digital Marketing IV', '2025-06-09 00:00:00', '2025-07-01 00:00:00', ' PT Sinergi Digital Solusindo', 'finish', 'offline', 1, '2025-06-10 04:30:13'),
('019745b2-d44a-730e-94b3-9780df9a2980', '1', '01970f85-154e-737d-a7ad-7611c747b431', 'coba', '2025-06-06 00:00:00', '2025-06-06 00:00:00', 'coba', 'finish', 'offline', 0, '2025-06-06 14:43:57'),
('019745b7-8537-74dc-bc87-235a81825e66', '2', '01970f85-154e-737d-a7ad-7611c747b431', 'coba', '2025-06-05 00:00:00', '2025-07-20 00:00:00', 'online', 'active', 'offline', 0, '2025-06-06 14:49:04'),
('01975636-9228-73af-a119-b84791db65e4', '1', '01969a3a-be00-72f9-b5a8-52cfaa23acc7', 'Fullstak Web Bassic 3', '2025-06-09 00:00:00', '2025-06-11 00:00:00', 'jln. merdeka, sleman, yogyakarta', 'finish', 'online', 0, '2025-06-09 19:41:46'),
('01976145-632e-71e9-af68-620e32675aa3', '1', '01969a3a-be00-72f9-b5a8-52cfaa23acc7', 'Full Stack Engineer Program', '2025-06-12 00:00:00', '2025-06-26 00:00:00', 'Jln. metero, jarioso, kec. kalihari, kab. sleman', 'finish', 'online', 1, '2025-06-11 23:13:46'),
('a4be103a-3ad5-11f0-8ecd-c64e354874b1', '1', '01970f7e-af89-750d-b406-af1e95bdab26', 'Pelatihan 2', '2025-02-21 01:00:00', '2025-02-22 01:00:00', 'online', 'finish', 'offline', 1, '2025-05-27 08:36:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attachment`
--
ALTER TABLE `attachment`
  ADD PRIMARY KEY (`attachment_id`),
  ADD KEY `report_id` (`report_id`);

--
-- Indexes for table `meeting`
--
ALTER TABLE `meeting`
  ADD PRIMARY KEY (`meeting_id`),
  ADD KEY `training_sesi_id` (`training_sesi_id`);

--
-- Indexes for table `otp_verify`
--
ALTER TABLE `otp_verify`
  ADD PRIMARY KEY (`id_otp`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `participant`
--
ALTER TABLE `participant`
  ADD PRIMARY KEY (`participant_id`);

--
-- Indexes for table `participant_training`
--
ALTER TABLE `participant_training`
  ADD PRIMARY KEY (`participant_training_id`),
  ADD KEY `participant_id` (`participant_id`),
  ADD KEY `training_sesi_id` (`training_sesi_id`);

--
-- Indexes for table `present`
--
ALTER TABLE `present`
  ADD PRIMARY KEY (`present_id`),
  ADD KEY `participant_id` (`participant_id`),
  ADD KEY `present_ibfk_2` (`meeting_id`);

--
-- Indexes for table `program_training`
--
ALTER TABLE `program_training`
  ADD PRIMARY KEY (`program_training_id`);

--
-- Indexes for table `report`
--
ALTER TABLE `report`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `program_training_id` (`training_sesi_id`),
  ADD KEY `report_ibfk_2` (`staff_id`),
  ADD KEY `report_ibfk_4` (`report_schedule_id`);

--
-- Indexes for table `report_content`
--
ALTER TABLE `report_content`
  ADD PRIMARY KEY (`report_content_id`),
  ADD KEY `report_type_id` (`report_type_id`);

--
-- Indexes for table `report_detail`
--
ALTER TABLE `report_detail`
  ADD PRIMARY KEY (`report_detail_id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `report_content_id` (`report_content_id`);

--
-- Indexes for table `report_schedule`
--
ALTER TABLE `report_schedule`
  ADD PRIMARY KEY (`report_schedule_id`),
  ADD KEY `schedule_report_ibfk_1` (`training_sesi_id`),
  ADD KEY `report_type_id` (`report_type_id`),
  ADD KEY `metting_id` (`meeting_id`);

--
-- Indexes for table `report_type`
--
ALTER TABLE `report_type`
  ADD PRIMARY KEY (`report_type_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `training_sesi`
--
ALTER TABLE `training_sesi`
  ADD PRIMARY KEY (`training_sesi_id`),
  ADD KEY `trainer_id` (`staff_id`),
  ADD KEY `program_training_id` (`program_training_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attachment`
--
ALTER TABLE `attachment`
  ADD CONSTRAINT `attachment_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `meeting`
--
ALTER TABLE `meeting`
  ADD CONSTRAINT `meeting_ibfk_1` FOREIGN KEY (`training_sesi_id`) REFERENCES `training_sesi` (`training_sesi_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `otp_verify`
--
ALTER TABLE `otp_verify`
  ADD CONSTRAINT `otp_verify_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `participant_training`
--
ALTER TABLE `participant_training`
  ADD CONSTRAINT `participant_training_ibfk_1` FOREIGN KEY (`participant_id`) REFERENCES `participant` (`participant_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `participant_training_ibfk_2` FOREIGN KEY (`training_sesi_id`) REFERENCES `training_sesi` (`training_sesi_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `present`
--
ALTER TABLE `present`
  ADD CONSTRAINT `present_ibfk_1` FOREIGN KEY (`participant_id`) REFERENCES `participant` (`participant_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `present_ibfk_2` FOREIGN KEY (`meeting_id`) REFERENCES `meeting` (`meeting_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `report`
--
ALTER TABLE `report`
  ADD CONSTRAINT `report_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `report_ibfk_3` FOREIGN KEY (`training_sesi_id`) REFERENCES `training_sesi` (`training_sesi_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `report_ibfk_4` FOREIGN KEY (`report_schedule_id`) REFERENCES `report_schedule` (`report_schedule_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `report_content`
--
ALTER TABLE `report_content`
  ADD CONSTRAINT `report_content_ibfk_1` FOREIGN KEY (`report_type_id`) REFERENCES `report_type` (`report_type_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `report_detail`
--
ALTER TABLE `report_detail`
  ADD CONSTRAINT `report_detail_ibfk_2` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `report_detail_ibfk_3` FOREIGN KEY (`report_content_id`) REFERENCES `report_content` (`report_content_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `report_schedule`
--
ALTER TABLE `report_schedule`
  ADD CONSTRAINT `report_schedule_ibfk_1` FOREIGN KEY (`training_sesi_id`) REFERENCES `training_sesi` (`training_sesi_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `report_schedule_ibfk_2` FOREIGN KEY (`report_type_id`) REFERENCES `report_type` (`report_type_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `report_schedule_ibfk_3` FOREIGN KEY (`meeting_id`) REFERENCES `meeting` (`meeting_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `training_sesi`
--
ALTER TABLE `training_sesi`
  ADD CONSTRAINT `training_sesi_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `training_sesi_ibfk_3` FOREIGN KEY (`program_training_id`) REFERENCES `program_training` (`program_training_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;