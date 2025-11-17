<?php
// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'sistema_ventas');

// Crear conexión
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Error de conexión: ' . $conn->connect_error]));
}

// Crear base de datos
$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
$conn->query($sql);
$conn->select_db(DB_NAME);

// Crear tabla productos
$sql = "CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria VARCHAR(100),
    imagen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nombre (nombre)
)";
$conn->query($sql);

// Crear tabla ventas
$sql = "CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_nombre VARCHAR(200) NOT NULL,
    cliente_email VARCHAR(200) NOT NULL,
    cliente_telefono VARCHAR(50),
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    metodo_pago VARCHAR(50),
    direccion_envio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($sql);

// Crear tabla detalle_ventas
$sql = "CREATE TABLE IF NOT EXISTS detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
)";
$conn->query($sql);

// Insertar productos de ejemplo SOLO SI NO EXISTEN
$result = $conn->query("SELECT COUNT(*) as count FROM productos");
if ($result) {
    $row = $result->fetch_assoc();
    
    if ($row['count'] == 0) {
        $productos = [
            ['Laptop Gaming Pro', 'Procesador Intel i7, 16GB RAM, RTX 4060', 1250000, 15, 'Electrónica', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400'],
            ['Mouse Inalámbrico RGB', 'Mouse gaming con iluminación RGB y 6 botones programables', 45000, 50, 'Accesorios', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'],
            ['Teclado Mecánico', 'Switches azules, retroiluminación RGB, cable trenzado', 85000, 30, 'Accesorios', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'],
            ['Monitor 27" 144Hz', 'Panel IPS, resolución 2K, tiempo de respuesta 1ms', 380000, 20, 'Electrónica', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'],
            ['Auriculares Gamer', 'Audio 7.1 surround, micrófono con cancelación de ruido', 95000, 40, 'Audio', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400'],
            ['Webcam Full HD', 'Resolución 1080p, micrófono incorporado, autofocus', 55000, 35, 'Accesorios', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400'],
            ['Silla Gamer Ergonómica', 'Respaldo reclinable, apoyabrazos 4D, soporte lumbar', 320000, 12, 'Muebles', 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400'],
            ['SSD 1TB NVMe', 'Velocidad de lectura 3500MB/s, ideal para gaming', 125000, 45, 'Almacenamiento', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400'],
            ['Mousepad XXL', 'Superficie de tela premium, base antideslizante', 25000, 60, 'Accesorios', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400'],
            ['Parlantes 2.1', 'Subwoofer incluido, potencia 80W, conexión Bluetooth', 78000, 25, 'Audio', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400']
        ];
        
        // Usar INSERT IGNORE para evitar duplicados si hay un problema de concurrencia
        $stmt = $conn->prepare("INSERT IGNORE INTO productos (nombre, descripcion, precio, stock, categoria, imagen) VALUES (?, ?, ?, ?, ?, ?)");
        
        if ($stmt) {
            foreach ($productos as $prod) {
                $stmt->bind_param("ssdiss", $prod[0], $prod[1], $prod[2], $prod[3], $prod[4], $prod[5]);
                $stmt->execute();
            }
            $stmt->close();
        }
    }
}

date_default_timezone_set('America/Argentina/Buenos_Aires');
?>