-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-11-2025 a las 01:04:04
-- Versión del servidor: 10.4.25-MariaDB
-- Versión de PHP: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_ventas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ventas`
--

CREATE TABLE `detalle_ventas` (
  `id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `detalle_ventas`
--

INSERT INTO `detalle_ventas` (`id`, `venta_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 1, 1, '1250000.00', '1250000.00'),
(2, 2, 1, 1, '1250000.00', '1250000.00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_actividades`
--

CREATE TABLE `log_actividades` (
  `id` int(11) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `detalles` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `categoria` varchar(100) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `stock`, `categoria`, `imagen`, `created_at`) VALUES
(1, 'Laptop Gaming Pro', 'Procesador Intel i7, 16GB RAM, RTX 4060', '1250000.00', 13, 'Electrónica', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400', '2025-11-17 17:28:40'),
(2, 'Mouse Inalámbrico RGB', 'Mouse gaming con iluminación RGB y 6 botones programables', '45000.00', 50, 'Accesorios', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', '2025-11-17 17:28:40'),
(3, 'Teclado Mecánico', 'Switches azules, retroiluminación RGB, cable trenzado', '85000.00', 30, 'Accesorios', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', '2025-11-17 17:28:40'),
(4, 'Monitor 27\" 144Hz', 'Panel IPS, resolución 2K, tiempo de respuesta 1ms', '380000.00', 20, 'Electrónica', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', '2025-11-17 17:28:40'),
(5, 'Auriculares Gamer', 'Audio 7.1 surround, micrófono con cancelación de ruido', '95000.00', 40, 'Audio', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', '2025-11-17 17:28:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `cliente_nombre` varchar(200) NOT NULL,
  `cliente_email` varchar(200) NOT NULL,
  `cliente_telefono` varchar(50) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(50) DEFAULT 'pendiente',
  `metodo_pago` varchar(50) DEFAULT NULL,
  `direccion_envio` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id`, `cliente_nombre`, `cliente_email`, `cliente_telefono`, `total`, `estado`, `metodo_pago`, `direccion_envio`, `created_at`) VALUES
(1, 'sebastian terrazo', 'seba@gmail.com', '1166582479', '1250000.00', 'confirmada', 'efectivo', 'un lugar lejano', '2025-11-17 17:42:37'),
(2, 'seba', 'seba@gmail.com', '11111AAA', '1250000.00', 'confirmada', 'tarjeta', 'aasa|', '2025-11-17 22:39:59');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venta_id` (`venta_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `log_actividades`
--
ALTER TABLE `log_actividades`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_nombre` (`nombre`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `log_actividades`
--
ALTER TABLE `log_actividades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
