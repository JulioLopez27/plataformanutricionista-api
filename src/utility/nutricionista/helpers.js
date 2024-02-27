import { prisma } from '../../../prisma/index.js'
import bcrypt from 'bcrypt'


//------------Funcion usada en el login-------
// Función para autenticar al usuario
export async function authenticateUser(email, plainTextPassword) {
  // Buscamos al usuario en la base de datos
  const user = await prisma.nutricionista.findUnique({
    where: { email },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      password: true,
      activo: true
    }
  });
  // Si el usuario no existe, lanzamos un error
  if (!user) {
    throw new Error('Email no encontrado');
  }
  if (!user.activo) {
    throw new Error('Usuario no activo');
  }
  // Comprobamos si la contraseña proporcionada coincide con la del usuario
  const passwordMatch = await bcrypt.compare(plainTextPassword, user.password);

  // Si la contraseña no coincide, lanzamos un error
  if (!passwordMatch) {
    throw new Error('Contraseña incorrecta');
  }

  // Si todo va bien, devolvemos el usuario
  return user;
}


//---------------------------------------------------------------------------------------------------------------------------------

//FUNCIONES AUXILIARES PARA LA LOGICA DE REGISTRO


// Función para crear un nuevo usuario
export async function createUser(user_data) {
  try {
    const user = await prisma.nutricionista.create({ data: user_data })
    // Si no se pudo crear el usuario, lanzamos un error
    if (!user) {
      throw new Error('No se pudo registrar sus datos')
    }
    return user;
  } catch (error) {
    // Si el error es debido a un email duplicado, lanzamos un error específico
    if (error.code === 'P2002' && error.meta && error.meta.target) {
      const target = error.meta.target[0]
      if (target.includes('email')) {
        throw new Error('El email ya está registrado')
      }
    }
    // Para cualquier otro error, lanzamos un error genérico
    throw new Error('Error al crear su usuario, contacte con la empresa')
  }
}

export async function createReport(report_data) {
  console.log(report_data)
  try {
    const report = await prisma.registro.create({data: report_data })
   
    // Si no se pudo crear el registro, lanzamos un error
    if (!report) {
      throw new Error('No se pudo crear el registro')
    }
    return report;

  } catch (error) {
    console.log(error)
    throw new Error('Error al crear el registro, contacte con la empresa')
  }
}


//crea un registro en la tabla nutri_pais 
export async function createUserCountryData(id_nutricionista, id_pais, ciudad) {
  try {
    const user_country_data = await prisma.nutricionista_pais.create({ data: { id_nutricionista, id_pais, ciudad } });
    return user_country_data;
  } catch (error) {
    throw new Error('Error al crear los datos del país del nutricionista');
  }
}

//se encarga de crear un registro en la tabal nutri_especialidad
export async function createUserSpecialtyData(id_nutricionista, id_especialidad) {
  try {
    const user_specialty_data = await prisma.nutricionista_especialidad.create({ data: { id_nutricionista, id_especialidad } });
    return user_specialty_data;
  } catch (error) {
    throw new Error('Error al crear los datos de la especialidad del nutricionista');
  }
}

// Función para validar si un email ya existe en la base de datos
export async function validateEmail(email) {
  const exist_user = await prisma.nutricionista.findUnique({ where: { email } });
  // Si el usuario existe, lanzamos un error
  if (exist_user) {
    throw new Error('Email ya existe');
  }
}


//Funcion para actualizar la informacion del nutricionista en las tablas
//Pais y especialidad

export async function updateRecord(model, id_nutricionista, data) {
  const record = await model.findFirst({ where: { id_nutricionista } });
  if (record) {
    await model.update({ where: { id: record.id }, data });
  }
}