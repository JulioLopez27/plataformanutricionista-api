//importa toda la aplicacion(config) del servicio a ser ejecutado
import { app } from './setup.js'
//crea e instacia el servicio que queda ejecutandose todo el tiempo
//para ejecutar el servidor en el puerto 3000
app.listen(3000)