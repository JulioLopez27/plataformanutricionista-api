import { prisma } from '../../../../prisma/index.js'
import {
    HTTP_STATUS_OK,
    HTTP_STATUS_BAD_REQUEST,
    HTTP_STATUS_UNAUTHORIZED,
    HTTP_STATUS_NOT_FOUND,
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from '../../../HTTP_STATUS/index.js'

//genero funcion para obtener los nutricionitas 
export async function getNutricionistas(ctx) {
    const { action } = ctx.request.body;

    //verifico que este presente el action en el body de la request
    if (!action) {
        ctx.body = { mensaje: "Error, falta action en la request." };
        ctx.status = HTTP_STATUS_UNAUTHORIZED;
        return;
    }

    if (action !== "get_nutricionistas") {
        ctx.body = { mensaje: "Error al obtener los nutricionistas, falló en la cadena del action." }
        ctx.status = HTTP_STATUS_BAD_REQUEST;
        return;
    }

    try {
        // obtengo todos los nutricionistas activos
        const nutricionistas = await prisma.nutricionista.findMany({
            select: {
                id: true, email: true, nombre: true, apellido: true, telefono: true,
                anos_experiencia: true, foto_diploma: true, id_chefDigitales: true,
                createdAt: true, activo: true, nutricionista_pais: {
                    select: {
                        id: true, id_pais: true, ciudad: true,
                        pais: { select: { nombre: true } }
                    }
                },
                nutricionista_especialidad: {
                    select: {
                        id: true, id_especialidad: true, createdAt: true,
                        especialidad: { select: { nombre: true } }
                    }
                }
            }
        })
        ctx.body = { nutricionistas }
        ctx.status = HTTP_STATUS_OK
    } catch (error) {
        ctx.body = { mensaje: "Se produjo algún error, se adjunta el error del catch: ", error }
        ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
}


export async function acceptRegistration(ctx) {
    try {
        const requestBody = ctx.request.body;
        //valida que venga el action con el aprobado
        if (requestBody.action !== "aprobado") {
            ctx.body = { mensaje: "No se pudo aprobar el nutricionista, falló el action." }
            ctx.status = HTTP_STATUS_UNAUTHORIZED;
            return;
        }
        if (!requestBody.email) {
            ctx.body = { mensaje: "No se proporcionó un correo electrónico." }
            ctx.status = HTTP_STATUS_UNAUTHORIZED
            return
        }
        const nutricionista = await prisma.nutricionista.findUnique({
            where: { email: requestBody.email },
        })

        if (!nutricionista) {
            ctx.body = { mensaje: "No se encontró el nutricionista con el correo electrónico proporcionado." }
            ctx.status = HTTP_STATUS_NOT_FOUND
            return;
        }
        if (nutricionista && nutricionista.activo) {
            ctx.body = { mensaje: "Ya está activo el nutricionista." }
            ctx.status = HTTP_STATUS_BAD_REQUEST;
            return;
        }

        const res = await prisma.nutricionista.update({
            where: { email: requestBody.email },
            data: { activo: true,id_chefDigitales:requestBody.idChefDigitales },
        });

        if (!res) {
            ctx.body = { mensaje: "Hubo problemas al actualizar el registro, se adjunta error.", res };
            ctx.status = HTTP_STATUS_BAD_REQUEST;
            return;
        }

        ctx.body = { mensaje: "Usuario actualizado con suceso.", res };
        ctx.status = HTTP_STATUS_OK;
    } catch (error) {
        ctx.body = { error: 'No se pudo actualizar el estado del registro.', error };
        ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR;
    }
}

export async function disabledNutricionista(ctx) {
    try {
        const requestBody = ctx.request.body
        //valida que venga el action con la cadena "desactivar"
        if (requestBody.action !== "desactivar_nutricionista") {
            ctx.body = { mensaje: "No se pudo desactivar el nutricionista, falló el action." }
            ctx.status = HTTP_STATUS_UNAUTHORIZED;
            return;
        }
        //valida que venga el email
        if (!requestBody.email) {
            ctx.body = { mensaje: "No se proporcionó un correo electrónico." }
            ctx.status = HTTP_STATUS_UNAUTHORIZED;
            return;
        }
        const nutricionista = await prisma.nutricionista.findUnique({
            where: { email: requestBody.email },
        })
        if (!nutricionista) {
            ctx.body = { mensaje: "No se encontró el nutricionista con el correo electrónico proporcionado." }
            ctx.status = HTTP_STATUS_NOT_FOUND;
            return;
        }
        if (nutricionista && !nutricionista.activo) {
            ctx.body = { mensaje: "Ya está desactivado el nutricionista." }
            ctx.status = HTTP_STATUS_BAD_REQUEST;
            return;
        }
        const res = await prisma.nutricionista.update({
            where: { email: requestBody.email },
            data: { activo: false },
        })
        if (!res) {
            ctx.body = { mensaje: "Hubo problemas al actualizar el registro, se adjunta error.", res };
            ctx.status = HTTP_STATUS_BAD_REQUEST;
            return;
        }
        ctx.body = { mensaje: "Usuario actualizado con suceso.", res }
        ctx.status = HTTP_STATUS_OK;
    } catch (error) {
        console.log(error);
        ctx.body = { mensaje: 'No se pudo actualizar el estado del registro.', error }
        ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
}
