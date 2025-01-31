# Frontend Application

Este proyecto es una aplicación frontend construida con React y Vite, diseñada para gestionar usuarios, pacientes y especialistas. La aplicación se comunica con un backend a través de diversos servicios, facilitando el manejo de datos y autenticación.
## Acceso a la Aplicación

Para ingresar a la aplicación, utiliza las siguientes credenciales:

### Doctor
- **Email**: doctor1@yopmail.com
- **Contraseña**: 20032003

### Admin
- **Email**: isaaccs2003@gmail.com
- **Contraseña**: securePassword123

## 

## Estructura del Proyecto

La estructura del proyecto está dividida en varios componentes clave:

### Servicios

Los servicios se encargan de conectar con el backend y consumir las peticiones necesarias para la funcionalidad de la aplicación. Los servicios están organizados de la siguiente manera:

- **User**: Maneja las operaciones relacionadas con los usuarios, incluyendo el inicio de sesión.
- **Patient**: Gestiona las solicitudes relacionadas con los pacientes.
- **Role**: Aunque los roles son fijos y se traen directamente de la base de datos, este servicio permite gestionar la lógica relacionada.
- **Specialist**: Maneja la información y operaciones relacionadas con los especialistas.
- **Shedule**: Toda la información que se recibe y envía al backend se gestiona desde este punto.

### Controladores

Los controladores tienen una estructura similar a la de los servicios, pero se encargan de manejar varias tareas adicionales, como:

- Procesar y gestionar datos recibidos.
- Manejar errores de forma adecuada.
- Coordinar con los componentes de vista.

### Vistas

Las vistas se dividen en componentes que permiten la interacción del usuario. Algunos de los componentes clave son:

- **Sidebar**: Encargado de la navegación entre los distintos componentes de la aplicación.
- **Layout**: Permite aplicar clases CSS y estilos a las vistas.
- **User Management**: Facilita la creación y gestión de usuarios y especialistas. Dentro de este componente, hay dos subcomponentes:
  - **Specialist**: Permite crear y editar especialistas.
  - **User**: Permite crear y editar usuarios.
- **Patient Manager**: Se encarga de la gestión de pacientes, aunque actualmente solo se permite editar la información de los pacientes existentes.
- **Shedule**: En esta sección se gestiona el módulo general para generar horarios aplicables a cualquier doctor.
- **Schedule Doctor**: Esta sección está diseñada específicamente para el doctor que inicia sesión. Se utiliza el local storage para obtener los datos del usuario correspondiente.


### Rutas y Configuración

La gestión de rutas se lleva a cabo a través de un archivo `config.ts`, donde se especifican las rutas y se integra el middleware correspondiente. En `app.tsx` se definen todas las rutas disponibles en la aplicación.

Además, se incluye un componente **ProtectedRoute.tsx**, que verifica la validez del token de usuario antes de permitir el acceso a ciertas rutas.

## Instalación

1. Clonar el repositorio del frontend.
2. Instalar las dependencias
   `npm install`
3. Ejecutar la aplicación:
 `npm start`


## Backend(Go)
(https://github.com/1756096090/backendMedicalRecord.git)

### Requisitos:
Go instalado en el sistema.
### Pasos:
Clonar el repositorio del backend.

Ejecutar la aplicación:
`go run main.go`
## Notas:
- Asegúrate de tener Node.js versión 18 para el frontend.
- La base de datos se conecta automáticamente utilizando las credenciales proporcionadas en el archivo de configuración
