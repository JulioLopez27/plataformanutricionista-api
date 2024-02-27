import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


import {
  prisma
} from '../../prisma/index.js'

import {
 
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_UNAUTHORIZED,

} from '../HTTP_STATUS/index.js'

import {
  stringToInt,
  positiveValue,
  validatePassword,
  validatePhone,
} from '../utility/shared.js'


import {
  authenticateUser,
  validateEmail,
  createUser,
  createUserCountryData,
  createUserSpecialtyData,
  updateRecord,
  createReport
} from '../utility/nutricionista/helpers.js'


import {
  Consultante
} from "./consultante.js";


export class Nutricionista {

  //se setea el tiempo de expiracion del token
  static set_expiration_time = "8h"
  static set_default_idChefDigitales = "sin identificador"

  constructor(nombre, apellido, correo, tituloEscaneado, experiencia, telefono, contraseña, país, ciudad) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.activo = false;
    this.correo = correo;
    this.tituloEscaneado = tituloEscaneado;
    this.experiencia = experiencia;
    this.telefono = telefono;
    this.contraseña = contraseña; // La contraseña se almacenará como un hash mediante un algoritmo
    this.país = país;
    this.ciudad = ciudad;
    this.consultantes = []
  }

  agregarConsultante(consultante) {
    // Verificar si el parámetro es una instancia de la clase Consultante
    if (consultante instanceof Consultante) {
      this.consultantes.push(consultante);
    } else {
      throw new Error("El parámetro debe ser una instancia de la clase Consultante");
    }
  }

  getConsultantes() {
    return this.consultantes;
  }

  static async getSpecialty(ctx) {
    try {
      const list = await prisma.especialidad.findMany()
      ctx.body = list
      ctx.status = HTTP_STATUS_CREATED
    } catch (error) {
      ctx.body = {
        message: 'Hubo un error al obtener las especialidades',
        error: error.message
      }
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
  }

  static async getCountries(ctx) {
    try {
      const list = await prisma.pais.findMany()
      ctx.body = list
      ctx.status = HTTP_STATUS_CREATED
    } catch (error) {
      ctx.body = {
        message: 'Hubo un error al obtener los países',
        error: error.message
      }
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
  }

  static async getProfileData(ctx) {

    if (!ctx.headers.authorization) {
      ctx.status = HTTP_STATUS_UNAUTHORIZED
      return
    }
    const [type, token] = ctx.headers.authorization.split(" ")
    const data = jwt.verify(token, process.env.JWT_SECRET)
    const userId = data.sub

    try {
      const getProfileData = await prisma.nutricionista.findUnique({
        where: {
          id: userId
        },
        select: {
          nombre: true,
          apellido: true,
          telefono: true,
          email: true,
          anos_experiencia: true,
        }
      })

      if (!getProfileData) {
        ctx.status = HTTP_STATUS_NOT_FOUND
        throw new Error('No se encontró el perfil del nutricionista')
      }

      const getProfileCountry = await prisma.nutricionista_pais.findFirst({
        where: {
          id_nutricionista: userId
        },
        select: {
          id_pais: true,
          ciudad: true
        }
      })


      if (!getProfileCountry) {
        ctx.status = HTTP_STATUS_NOT_FOUND
        throw new Error('No se encontró el nutricionista o no tiene país asociado.')
      }

      const getProfileSpecialty = await prisma.nutricionista_especialidad.findFirst({
        where: {
          id_nutricionista: userId
        },
        select: {
          id_especialidad: true
        }
      })

      if (!getProfileSpecialty) {
        ctx.status = HTTP_STATUS_NOT_FOUND
        throw new Error('No se encontró el nutricionista o no tiene especialidad asociada.')
      }

      const {
        nombre,
        apellido,
        telefono,
        email,
        anos_experiencia
      } = getProfileData
      const {
        id_pais,
        ciudad
      } = getProfileCountry
      const {
        id_especialidad
      } = getProfileSpecialty

      const profileData = {
        nombre,
        apellido,
        telefono,
        email,
        especialidad: id_especialidad,
        anos_experiencia,
        pais: id_pais,
        ciudad
      }

      ctx.body = profileData
      ctx.status = HTTP_STATUS_CREATED
    } catch (error) {
      console.log(error)
    }
  }



  static async getConsultantes(ctx) {

    const [type, token] = ctx.headers.authorization.split(" ")
    const data = jwt.verify(token, process.env.JWT_SECRET)
    const userId = data.sub

    try {
      const consultantesID = await prisma.consultante.findMany({
        where: {
          id_nutricionista: parseInt(userId)
        }
      })

      // const {id_nutricionista,createdAt,updatedAt, ...result } = consultantesID
      //const result = consultantesID.map((consultante) => consultante.id_consultante);

      // const consultantesNombres = await prisma.consultante.findMany({
      //   where: {

      //     id: {
      //       in: co
      //     }
      //   }
      // })
      //console.log(result)
      //const nombres = "["
      const datosConsultantes = consultantesID.map((consultante) => ({
        id: consultante.id,
        nombre: consultante.nombre,
        apellido: consultante.apellido,
        email: consultante.email,
      })); //  nombres = nombres + consultantesNombres.map((consultante) => '{nombre:"' + consultante.nombre + '", apellido:"' + consultante.apellido + '", email:"' + consultante.e/mail+"'}");
      // nombres = nombres + "]"


      ctx.body = datosConsultantes;
      ctx.status = HTTP_STATUS_CREATED

    } catch (error) {
      // Si ocurre un error, preparamos un mensaje de error para el cliente
      console.log(error)
      ctx.body = {
        error: error.message
      }

      // Establecemos el código de estado HTTP a 500 (Error interno del servidor)
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR

    }

  }

  static async getReport(ctx) {
    try {
      console.log(ctx.query.id)
      const reportData = await prisma.registro.findUnique({
        where: {
          id: parseInt(ctx.query.id)
          //  id: stringToInt("2")
        },
        select: {
          id: true,
          id_nutricionista: true,
          id_consultante: true,
          nota: true,
          tipo: true,
        }
      })

      const datosRegistro = {
        id: reportData.id,
        id_nutricionista: reportData.id_nutricionista,
        id_consultante: reportData.id_consultante,
        nota: reportData.nota,
        tipo: reportData.tipo,
      };
      console.log(datosRegistro)
      ctx.body = datosRegistro;
      ctx.status = HTTP_STATUS_CREATED

    } catch (error) {
      console.log(error)
      ctx.body = {
        error: error.message,


      }
      // Establecemos el código de estado HTTP a 500 (Error interno del servidor)
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR

    }

  }


  static async getHistory(ctx) {
    //    const [type, token] = ctx.headers.authorization.split(" ")
    //  const data = jwt.verify(token, process.env.JWT_SECRET)
    //const userId = data.sub



    try {
      const historyID = await prisma.consultante_receta.findMany({
        where: {

          // Recordar hacer esto dinamico!!!
          id_nutricionista: 27,
        },
      });
      //console.log(historyID)
      const datosHistorico = await Promise.all(
        historyID.map(async (historico) => {
          const receta = await prisma.receta.findFirst({
            where: {
              id: historico.id_receta
            },
            select: {
              nombre: true
            }, // Fetch the Receta.name
          });

          return {
            nombre: receta.nombre,
            fechaEnvio: historico.fecha_envio,
          };
        })
      );

      //  console.log(datosHistorico);
      ctx.body = datosHistorico;
      ctx.status = HTTP_STATUS_CREATED;
    } catch (error) {
      // If an error occurs, prepare an error message for the client
      ctx.body = {
        error: error.message
      };
      // Set the HTTP status code to 500 (Internal Server Error)
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR;
    }
  }

  static async getHistoryInformes(ctx) {
    const [type, token] = ctx.headers.authorization.split(" ")
    const data = jwt.verify(token, process.env.JWT_SECRET)
    const userId = data.sub
    try {

      const idConsultante = ctx.request.body.id;
      console.log(idConsultante)
      const historyID = await prisma.registro.findMany({
        where: {

          // Recordar hacer esto dinamico!!!
          id_nutricionista: parseInt(userId),
          id_consultante: parseInt(idConsultante)
          // enviado: false
        },
      });
      console.log("pre - map")

      const datosHistorico = historyID.map((registro) => ({
        nombre: registro.tipo,
        fechaEnvio: registro.fecha,
        enviado: registro.enviado,
        id: registro.id
      }));

      console.log("Erespuesta")
      //  console.log(datosHistorico);
      ctx.body = datosHistorico;
      ctx.status = HTTP_STATUS_CREATED;
    } catch (error) {
      // If an error occurs, prepare an error message for the client
      ctx.body = {
        error: error.message
      };
      // Set the HTTP status code to 500 (Internal Server Error)
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR;
    }
  }


  //creacion de un nutricionista
  // Función para manejar el inicio de sesión de un usuario
  static async login(ctx) {
    const [type, token] = ctx.headers.authorization.split(" ")
    const [email, plainTextPassword] = Buffer.from(token, 'base64').toString().split(":")
    try {
      // Extraemos el email y la contraseña del cuerpo de la petición
      // const email = ctx.request.body.email
      // const plainTextPassword = ctx.request.body.password

      await validatePassword(plainTextPassword)
      // Intentamos autenticar al usuario
      const user = await authenticateUser(email, plainTextPassword)

      // Si la autenticación es exitosa, eliminamos la contraseña del objeto del usuario
      const {
        password,
        ...result
      } = user

      // Creamos un token de acceso para el usuario
      const accesToken = jwt.sign({
        sub: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        expiresIn: Nutricionista.set_expiration_time,
      }, process.env.JWT_SECRET)

      // Preparamos la respuesta para el cliente
      ctx.body = {
        user: result,
        accesToken
      }
      // Establecemos el código de estado HTTP a 201 (Creado)
      ctx.status = HTTP_STATUS_CREATED

    } catch (error) {
      // Si ocurre un error, preparamos un mensaje de error para el cliente
      ctx.body = {
        error: error.message
      }
      // Establecemos el código de estado HTTP a 500 (Error interno del servidor)
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
  }

  // *codigo para crear un usuario Nutricionista y guardarlo en la db
  static async signup(ctx) {
    try {
      // extraigo el email y lo busco para ver si existe en la DB
      const email = ctx.request.body.email

      //verifico en la DB que no existe ese email
      await validateEmail(email)

      //valido la contraseña
      await validatePassword(ctx.request.body.password)

      //valido el telefono
      await validatePhone(ctx.request.body.telefono)
      //email no existente, hasheo la pass ingresada por el usuario
      //! hasheo la pass que el usuario ingresa / 10->round for hash encryption
      const hashPassword = await bcrypt.hash(ctx.request.body.password, 10)

      //parseo a int los valores que recibo del front
      const anos = await positiveValue(ctx.request.body.anos_experiencia)
      const id_especialidad = await stringToInt(ctx.request.body.especialidad)
      const id_pais = await stringToInt(ctx.request.body.pais)


      const ciudad = ctx.request.body.ciudad
      if (ciudad === "") {
        ctx.status = HTTP_STATUS_NOT_FOUND
        return
      }

      //si no recibo id de chefDigitales, seteo uno propio "sin identificador", para evitar inyeccion de datos
      const idChef = parseInt(ctx.request.body.id_chefDigitales) || Nutricionista.set_default_idChefDigitales
      //guardo en una variable la informacion del diploma que el nutricionista subio 
      const {
        foto_diploma
      } = ctx.request.files

      //creo el obj user_data para darle a prisma y crear el nutricionista
      const user_data = {
        email,
        password: hashPassword,
        nombre: ctx.request.body.nombre,
        apellido: ctx.request.body.apellido,
        telefono: ctx.request.body.telefono,
        anos_experiencia: anos,
        //guardo la ruta del diploma
        foto_diploma: foto_diploma ? foto_diploma.filepath : null,
        id_chefDigitales: idChef,
      }

      //se envian los datos del registro para crear el usuario 
      const user = await createUser(user_data)
      const id_nutricionista = user.id
      await createUserCountryData(id_nutricionista, id_pais, ciudad)
      await createUserSpecialtyData(id_nutricionista, id_especialidad)

      //llamo metodo para enviar datos servicio de chefDigitales
      //para pre-registro
      preRegistro(user_data, id_pais, ciudad, id_especialidad)

      //retiro la pass de los demas attr
      const {
        password,
        ...result
      } = user

      ctx.body = {
        user: result
      }
      ctx.status = HTTP_STATUS_CREATED

    } catch (error) {
      ctx.body = {
        error: error.message
      }
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
  }

  //funct usada en el metodo de signup
  //para el pre-registro
  static async preRegistro(user_data, id_pais, ciudad, id_especialidad) {
    try {
      await fetch('https://cheffdigital.com/cheffadmin/api/api3.php/registroUsuarioNutricionista', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_data,
          id_pais,
          ciudad,
          id_especialidad
        })
      });
    } catch (error) {
      console.error('Error al enviar los datos a ChefDigitales:', error);
      throw new Error('Error al enviar los datos a ChefDigitales.');
    }
  }



  static async updateProfile(ctx) {

    if (!ctx.headers.authorization) {
      ctx.status = HTTP_STATUS_UNAUTHORIZED
      return
    }
    const [type, token] = ctx.headers.authorization.split(" ")
    const data = jwt.verify(token, process.env.JWT_SECRET)
    const userId = data.sub

    const nombre = ctx.request.body.nombre
    const apellido = ctx.request.body.apellido
    const email = ctx.request.body.email
    const telefono = ctx.request.body.telefono

    try {

      const id_pais = await stringToInt(ctx.request.body.pais)
      const id_especialidad = await stringToInt(ctx.request.body.especialidad)
      const anos_experiencia = await positiveValue(ctx.request.body.anos_experiencia)
      await validatePhone(telefono)

      let profileData = {
        nombre,
        apellido,
        email,
        telefono,
        anos_experiencia
      }
      const profile_countrie_data = {
        id_pais,
        ciudad: ctx.request.body.ciudad
      }
      //valido el telefono


      //si recibo contraseña: valido,hasheo y la seteo dentro de profileData
      if (ctx.request.body.password) {
        await validatePassword(ctx.request.body.password)
        //! hasheo la pass que el usuario ingresa / 10->round for hash encryption
        const hashPassword = await bcrypt.hash(ctx.request.body.password, 10)
        //parseo a int los valores que recibo del front
        profileData = {
          nombre,
          apellido,
          email,
          telefono,
          anos_experiencia,
          password: hashPassword
        }
      }


      const user = await prisma.nutricionista.update({
        where: {
          id: userId
        },
        data: profileData,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true
        }
      })

      //invoco la funct aux updateRecord de params(NombreDeLaTabla,id,data) para que me haga las actualizaciones
      await updateRecord(prisma.nutricionista_pais, userId, profile_countrie_data)
      await updateRecord(prisma.nutricionista_especialidad, userId, {
        id_especialidad
      })

      const accesToken = jwt.sign({
        sub: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        expiresIn: Nutricionista.set_expiration_time,
      }, process.env.JWT_SECRET)


      ctx.body = {
        user,
        accesToken
      }
      ctx.status = HTTP_STATUS_CREATED
    } catch (error) {

      if (error instanceof prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        ctx.body = {
          error: "No se encontro registro para actualizar"
        }
        ctx.status = HTTP_STATUS_NOT_FOUND
        return
      }

      console.error('Error al actualizar el perfil:', error);
      ctx.body = {
        error: 'Error al actualizar el perfil.'
      };
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
  }

  static async saveReport(ctx) {

    console.log("Frontera 01")

    try {
      const [type, token] = ctx.headers.authorization.split(" ")
      const data = jwt.verify(token, process.env.JWT_SECRET)
      const id_nutri = data.sub

      const cuerpo = ctx.request.body.cuerpo
      const titulo = ctx.request.body.tipo
      const id_consult = ctx.request.body.idConsultante

      console.log("Frontera 02" + id_consult)

      //CONSULTANTE TIENE QUE SER DINAMICO, ver si lo saco de la URL o que onda.

      //CONSULTANTE TIENE QUE SER DINAMICO, ver si lo saco de la URL o que onda.

      //const id_consult=2
      //const id_nutri = 27
      // const id_consult = ctx.request.body.id_consult
      // const id_nutri = ctx.request.body.id_nutri
      // const id_nutri = ctx.request.body.id_nutri
      //creo el obj registro_data para darle a prisma y crear el informe
      const report_data = {
        id_nutricionista: parseInt(id_nutri),
        id_consultante: parseInt(id_consult),
        fecha: new Date(),
        nota: cuerpo,
        tipo: titulo,
        enviado: false
      }


      //se envian los datos del registro para crear el reporte
      const reporte = await createReport(report_data)

      ctx.body = {
        report: reporte,
      }
      ctx.status = HTTP_STATUS_CREATED

    } catch (error) {
      ctx.body = {
        error: error.message
      }
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
  }
  static async getConsultantDataForId(ctx) {
    try {
      // Verifica la existencia del token de autorización en los encabezados de la solicitud
      if (!ctx.headers.authorization) {
        ctx.status = HTTP_STATUS_UNAUTHORIZED;
        return
      }

      const [type, token] = ctx.headers.authorization.split(" ");
      const data = jwt.verify(token, process.env.JWT_SECRET);
      const idNutricionista = data.sub;
      const idConsultanteString = ctx.request.body.id_consultante // Obtener el valor asociado con la clave 'id_consultante'
      const id_consultante = await stringToInt(idConsultanteString)


      // Verificar la autorización del consultante en la base de datos
      const autorizado = await prisma.consultante.findUnique({
        where: {
          id: id_consultante,
          id_nutricionista: idNutricionista
        }
      })

      if (!autorizado) {
        ctx.status = HTTP_STATUS_UNAUTHORIZED;
        return
      }

      // Obtener los datos generales del consultante
      const generalData = await prisma.consultante.findUnique({
        where: {
          id: id_consultante
        },
        select: {
          nombre: true,
          apellido: true,
          fechaNacimiento: true,
          sexo: true,
          telefono: true
        }
      })
      // Construir la respuesta con los datos generales del consultante
      const responseGeneralData = {
        nombre: generalData.nombre,
        apellido: generalData.apellido,
        fechaNacimiento: generalData.fechaNacimiento,
        sexo: generalData.sexo,
        telefono: generalData.telefono
      }
      // Establecer la respuesta y el código de estado HTTP
      ctx.body = responseGeneralData
      ctx.status = HTTP_STATUS_CREATED // Cambiado a HTTP_STATUS_OK ya que se obtuvieron los datos correctamente
    } catch (error) {
      console.log(error);
      ctx.body = {
        error: error.message
      }
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
  }

  static async getTipoDietaForId(ctx) {

    const [type, token] = ctx.headers.authorization.split(" ");
    const data = jwt.verify(token, process.env.JWT_SECRET);

    const idConsultanteString = ctx.request.body.id_consultante // Obtener el valor asociado con la clave 'id_consultante'
    const id_consultante = await stringToInt(idConsultanteString)


    try {

      const tipoDieta = await prisma.tipodieta.findFirst({
        where: {
          id_consultante: id_consultante
        },
        select: {
          vegetariano: true,
          vegano: true,
          pescetariano: true,
          crudivegano: true,
          sinGluten: true,
          sinLactosa: true,
          keto: true
        }
      })
      const responseTipoDieta = {
        vegetariano: tipoDieta.vegetariano,
        vegano: tipoDieta.vegano,
        pescetariano: tipoDieta.pescetariano,
        crudivegano: tipoDieta.crudivegano,
        sinGluten: tipoDieta.sinGluten,
        sinLactosa: tipoDieta.sinLactosa,
        keto: tipoDieta.keto
      };

      ctx.body = responseTipoDieta;
      ctx.status = HTTP_STATUS_CREATED

    } catch (error) {
      console.log("ERROR: " + error)
      ctx.body = {
        error: error.message
      }
      // Establecemos el código de estado HTTP a 500 (Error interno del servidor)
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
  }




  static async getAfeccionesForId(ctx) {

    const [type, token] = ctx.headers.authorization.split(" ");
    const data = jwt.verify(token, process.env.JWT_SECRET);

    const idConsultanteString = ctx.request.body.id_consultante // Obtener el valor asociado con la clave 'id_consultante'
    const id_consultante = await stringToInt(idConsultanteString)

    //console.log("getAfeccionesForId")


    try {
      const afecciones = await prisma.afeccion.findFirst({
        where: {
          id_consultante: id_consultante
        },
        select: {
          diabetes_tipo_1: true,
          diabetes_tipo_2: true,
          celiaquismo: true,
          hipertension: true,
          alergias: true,
          enfermedad_renal: true,
          hipercolesterolemia: true,
          anemia: true,
          obesidad: true
        }
      })

      const responseAfecciones = {
        diabetes_tipo_1: afecciones.diabetes_tipo_1,
        diabetes_tipo_2: afecciones.diabetes_tipo_2,
        celiaquismo: afecciones.celiaquismo,
        hipertension: afecciones.hipertension,
        alergias: afecciones.alergias,
        enfermedad_renal: afecciones.enfermedad_renal,
        hipercolesterolemia: afecciones.hipercolesterolemia,
        anemia: afecciones.anemia,
        obesidad: afecciones.obesidad
      };

      ctx.body = responseAfecciones;
      ctx.status = HTTP_STATUS_CREATED

      //console.log("responseAfecciones -> " + ctx.body);

    } catch (error) {
      //console.log(error)
      ctx.body = {
        error: error.message,
      }
      // Establecemos el código de estado HTTP a 500 (Error interno del servidor)
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR

    }
    return

  }


  static async getAnamnesisForId(ctx) {
    try {


      const [type, token] = ctx.headers.authorization.split(" ");
      const data = jwt.verify(token, process.env.JWT_SECRET);

      const idConsultanteString = ctx.request.body.id_consultante // Obtener el valor asociado con la clave 'id_consultante'
      const id_consultante = await stringToInt(idConsultanteString)


      const anamnesis = await prisma.anamnesis.findFirst({
        where: {
          id_consultante: id_consultante
        },
        select: {
          fecha: true,
          peso: true,
          altura: true,
          constitucion_corporal: true,
          historia_alimenticia: true,
          horarios_alimenticios: true,
          deficits_nutricionales: true,
          objetivos_clinicos: true,

        }
      })


      const responseAnamnesis = {
        fecha: anamnesis.fecha,
        peso: anamnesis.peso,
        altura: anamnesis.altura,
        constitucion_corporal: anamnesis.constitucion_corporal,
        historia_alimenticia: anamnesis.historia_alimenticia,
        horarios_alimenticios: anamnesis.horarios_alimenticios,
        deficits_nutricionales: anamnesis.deficits_nutricionales,
        objetivos_clinicos: anamnesis.objetivos_clinicos,
      };

      ctx.body = responseAnamnesis;
      ctx.status = HTTP_STATUS_CREATED


    } catch (error) {
      console.log(error)
      ctx.body = {
        error: error.message,
      }
      // Establecemos el código de estado HTTP a 500 (Error interno del servidor)
      ctx.status = HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
    return
  }



}