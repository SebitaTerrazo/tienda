<?php
// Habilitar errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Verificar que llegamos aquí
file_put_contents('debug.txt', date('Y-m-d H:i:s') . " - API ejecutándose\n", FILE_APPEND);

// Conectar a la base de datos
$conn = new mysqli('localhost', 'root', '', 'sistema_ventas');

if ($conn->connect_error) {
    die(json_encode([
        'success' => false, 
        'error' => 'Error de conexión: ' . $conn->connect_error
    ]));
}

$conn->set_charset('utf8');

// Obtener método y acción
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

file_put_contents('debug.txt', "Método: $method, Acción: $action\n", FILE_APPEND);

// Función de limpieza
function limpiar($data) {
    global $conn;
    return $conn->real_escape_string(htmlspecialchars(strip_tags(trim($data))));
}

// MANEJO DE PETICIONES GET
if ($method === 'GET') {
    
    if ($action === 'productos') {
        $sql = "SELECT * FROM productos ORDER BY nombre";
        $result = $conn->query($sql);
        
        if (!$result) {
            echo json_encode(['success' => false, 'error' => $conn->error]);
            exit;
        }
        
        $productos = [];
        while ($row = $result->fetch_assoc()) {
            $productos[] = $row;
        }
        
        echo json_encode(['success' => true, 'data' => $productos]);
        exit;
    }
    
    if ($action === 'categorias') {
        $sql = "SELECT DISTINCT categoria FROM productos ORDER BY categoria";
        $result = $conn->query($sql);
        
        if (!$result) {
            echo json_encode(['success' => false, 'error' => $conn->error]);
            exit;
        }
        
        $categorias = [];
        while ($row = $result->fetch_assoc()) {
            $categorias[] = $row['categoria'];
        }
        
        echo json_encode(['success' => true, 'data' => $categorias]);
        exit;
    }
    
    if ($action === 'estadisticas') {
        $stats = [];
        
        $result = $conn->query("SELECT COUNT(*) as total FROM ventas");
        $stats['total_ventas'] = $result->fetch_assoc()['total'];
        
        $result = $conn->query("SELECT SUM(total) as ingresos FROM ventas WHERE estado != 'cancelada'");
        $row = $result->fetch_assoc();
        $stats['ingresos_totales'] = $row['ingresos'] ?? 0;
        
        $result = $conn->query("SELECT SUM(cantidad) as total FROM detalle_ventas");
        $row = $result->fetch_assoc();
        $stats['productos_vendidos'] = $row['total'] ?? 0;
        
        $result = $conn->query("SELECT p.nombre, SUM(d.cantidad) as total 
                               FROM detalle_ventas d 
                               JOIN productos p ON d.producto_id = p.id 
                               GROUP BY d.producto_id 
                               ORDER BY total DESC LIMIT 1");
        $row = $result->fetch_assoc();
        $stats['producto_popular'] = $row ? $row['nombre'] : 'N/A';
        
        $result = $conn->query("SELECT COUNT(*) as total FROM productos WHERE stock < 10");
        $stats['stock_bajo'] = $result->fetch_assoc()['total'];
        
        echo json_encode(['success' => true, 'data' => $stats]);
        exit;
    }
    
    if ($action === 'ventas') {
        $sql = "SELECT v.*, 
                (SELECT COUNT(*) FROM detalle_ventas WHERE venta_id = v.id) as total_items
                FROM ventas v 
                ORDER BY v.created_at DESC";
        $result = $conn->query($sql);
        
        $ventas = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $ventas[] = $row;
            }
        }
        
        echo json_encode(['success' => true, 'data' => $ventas]);
        exit;
    }
    
    echo json_encode(['success' => false, 'error' => 'Acción GET no válida: ' . $action]);
    exit;
}

// MANEJO DE PETICIONES POST
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'venta') {
        $conn->begin_transaction();
        
        try {
            $sql = "INSERT INTO ventas (cliente_nombre, cliente_email, cliente_telefono, total, metodo_pago, direccion_envio, estado) 
                    VALUES (?, ?, ?, ?, ?, ?, 'confirmada')";
            $stmt = $conn->prepare($sql);
            
            $nombre = limpiar($data['cliente_nombre']);
            $email = limpiar($data['cliente_email']);
            $telefono = limpiar($data['cliente_telefono']);
            $total = floatval($data['total']);
            $metodo = limpiar($data['metodo_pago']);
            $direccion = limpiar($data['direccion_envio']);
            
            $stmt->bind_param("sssdss", $nombre, $email, $telefono, $total, $metodo, $direccion);
            $stmt->execute();
            $venta_id = $conn->insert_id;
            
            $stmt = $conn->prepare("INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)");
            
            foreach ($data['items'] as $item) {
                $producto_id = intval($item['producto_id']);
                $cantidad = intval($item['cantidad']);
                $precio = floatval($item['precio']);
                $subtotal = $cantidad * $precio;
                
                $stmt->bind_param("iiidd", $venta_id, $producto_id, $cantidad, $precio, $subtotal);
                $stmt->execute();
                
                $conn->query("UPDATE productos SET stock = stock - $cantidad WHERE id = $producto_id");
            }
            
            $conn->commit();
            echo json_encode(['success' => true, 'id' => $venta_id, 'message' => 'Venta registrada']);
            exit;
            
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        }
    }
    
    if ($action === 'producto') {
        $sql = "INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        $nombre = limpiar($data['nombre']);
        $descripcion = limpiar($data['descripcion']);
        $precio = floatval($data['precio']);
        $stock = intval($data['stock']);
        $categoria = limpiar($data['categoria']);
        $imagen = limpiar($data['imagen']);
        
        $stmt->bind_param("ssdiss", $nombre, $descripcion, $precio, $stock, $categoria, $imagen);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        exit;
    }
}

// MANEJO DE PETICIONES PUT
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'producto') {
        $sql = "UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, categoria=?, imagen=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        
        $nombre = limpiar($data['nombre']);
        $descripcion = limpiar($data['descripcion']);
        $precio = floatval($data['precio']);
        $stock = intval($data['stock']);
        $categoria = limpiar($data['categoria']);
        $imagen = limpiar($data['imagen']);
        $id = intval($data['id']);
        
        $stmt->bind_param("ssdissi", $nombre, $descripcion, $precio, $stock, $categoria, $imagen, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        exit;
    }
    
    if ($action === 'venta_estado') {
        $sql = "UPDATE ventas SET estado = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        $estado = limpiar($data['estado']);
        $id = intval($data['id']);
        
        $stmt->bind_param("si", $estado, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        exit;
    }
}

// MANEJO DE PETICIONES DELETE
if ($method === 'DELETE') {
    parse_str(file_get_contents("php://input"), $data);
    
    if ($action === 'producto') {
        $id = intval($data['id']);
        $sql = "DELETE FROM productos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => $stmt->error]);
        }
        exit;
    }
}

echo json_encode(['success' => false, 'error' => 'Método o acción no válida']);
$conn->close();
?>