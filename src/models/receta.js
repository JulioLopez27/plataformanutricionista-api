import { createReadStream, createWriteStream } from 'fs'
import { dirname, join } from 'path'
import path from 'path'
import { fileURLToPath } from 'url'
import { format } from 'date-fns'

import {
    prisma
} from '../../prisma/index.js'
import {
    HTTP_STATUS_OK,
    HTTP_STATUS_CREATED,
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    HTTP_STATUS_UNAUTHORIZED,
    HTTP_STATUS_BAD_REQUEST,

} from '../HTTP_STATUS/index.js'

import jwt from 'jsonwebtoken'


const DificultadReceta = {
    FACIL: "Facil",
    MEDIO: "Medio",
    DIFICIL: "Difícil"
};
/*
const RecetaPara = {
    aGusto: "Fácil",
    atado: "Medio",
    barra: "Barra",
    baston: "Baston",
    bolsa: "Bolsa",
    bote: "Bote",
    botecito: "Botecito",
    botella: "Botella",
    cda: "c/da", 
    XXXXXX: "XXXXXX",``
};
*/
export class Receta {
    constructor(nombre, ingredientes, instrucciones, categorias) {
        this.nombre = nombre;
        this.ingredientes = ingredientes;
        this.instrucciones = instrucciones;
        this.categorias = categorias; // Lista de objetos Categoria_Receta
        // Verificar que el tipo proporcionado esté en DificultadReceta
        if (Object.values(DificultadReceta).includes(dificultad)) {
            this.dificultad = dificultad;
        } else {
            throw new Error("Tipo de dificultad no válido");
        }
        this.tiempoElaboracion = tiempoElaboracion;
        this.ingredientes = [],
            this.pasos = []

    }

    agregarCategoria(categoria) {
        this.categorias.push(categoria);
    }



    static async getRecipes(ctx) {
        if (!ctx.headers.authorization) {
            ctx.status = HTTP_STATUS_UNAUTHORIZED
            return
        }
        const [type, token] = ctx.headers.authorization.split(" ")
        const data = jwt.verify(token, process.env.JWT_SECRET)
        const userId = data.sub

        try {
            const recetas = await prisma.recipes.findMany({
                include: {
                    recipeimages: true  // Include de la relación con la tabla RecipeImages
                }
            })
            if (recetas.length === 0) {
                ctx.body = { mensaje: "No existe recetas." }
                ctx.status = HTTP_STATUS_BAD_REQUEST
                return
            }

            ctx.body = recetas
            ctx.status = HTTP_STATUS_OK
        } catch (error) {
            ctx.body = { mensaje: "Error al obtener las recetas.", error }
            ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
        }
    }


    // Método para obtener la ruta de la carpeta de subidas
    static async getUploadFolderPath() {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = dirname(__filename)
        const partenDir = dirname(__dirname)
        return join(partenDir, 'uploads')
    }

    static async guardarImagen(rutaImagen, nombreArchivo) {
        try {
            //obtengo la extension de la imagen
            const extension = path.extname(nombreArchivo)
            const nombreBase = path.basename(nombreArchivo, extension)
            // Generar un sello de tiempo
            const timestamp = format(new Date(), 'yyyyMMddHHmmss')
            // Crear un nuevo nombre de archivo con el sello de tiempo
            const nuevoNombreArchivo = `${nombreBase}-${timestamp}${extension}`
            //genero la ruta de destino con el nombre del archivo
            const rutaDestino = join(await this.getUploadFolderPath(), nuevoNombreArchivo)

            // Crear un flujo de lectura desde el archivo temporal
            const streamLectura = createReadStream(rutaImagen)

            // Crear un flujo de escritura hacia el archivo de destino
            const streamEscritura = createWriteStream(rutaDestino);

            // Pipe para transferir el contenido del archivo temporal al archivo de destino
            streamLectura.pipe(streamEscritura);
            //  Manejar eventos de finalización y error
            streamEscritura.on('finish', () => { })
            streamEscritura.on('error', () => { })
            return rutaDestino
        } catch (error) {
            console.log('Error-> ', error);
        }
    }

    static async createRecipe(ctx) {

        if (!ctx.headers.authorization) {
            ctx.status = HTTP_STATUS_UNAUTHORIZED
            return
        }
        const [type, token] = ctx.headers.authorization.split(" ")
        const data = jwt.verify(token, process.env.JWT_SECRET)

        //obtengo el archivo
        const { recipeImage } = ctx.request.files
        //obtengo la ruta del archivo->lo que me sirve
        const rutaImagen = recipeImage.filepath


        const nombreImagen = recipeImage.originalFilename
        try {
            const { recipe_name, description, categories, difficulty, tiempo, ingredientes, alergias, vegano, vegetariano, celiaco, has_video, user_id, healthy, byName, status, page, perPage } = ctx.request.body;

            // Verificar que el tipo de dificultad esté en DificultadReceta
            if (!Object.values(DificultadReceta).includes(difficulty)) {
                ctx.body = { mensaje: "No ingresó un valor de dificultad válido." }
                ctx.status = HTTP_STATUS_BAD_REQUEST
                return
            }
            console.log(ctx.request.body);
            const image_path = await this.guardarImagen(rutaImagen, nombreImagen)

            const recipeImage = await prisma.recipeimages.create({
                data: { image_path }
            })

            const recipe = await prisma.recipes.create({
                data: {
                    recipe_name: recipe_name || '',
                    description: description || '',
                    categories: categories || '',
                    difficulty: difficulty || '',
                    tiempo: tiempo || '',
                    ingredientes: ingredientes || '',
                    alergias: alergias || '',
                    vegano: vegano,
                    vegetariano: vegetariano || false,
                    celiaco: celiaco || false,
                    has_video: has_video || false,
                    user_id: user_id || '',
                    healthy: healthy || false,
                    byName: '',
                    status: '',
                    page: '',
                    perPage: '',
                    recipe_image_id: recipeImage.id,
                },
            })

            if (!recipe) {
                ctx.body = { mensaje: 'No se pudo crear la receta' }
                ctx.status = HTTP_STATUS_BAD_REQUEST
                return
            }
            ctx.body = { mensaje: 'se agrego la imagen ' };
            ctx.status = HTTP_STATUS_CREATED;
        } catch (error) {
            ctx.body = { mensaje: 'Errores.' }
            ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
        }
    }





}
