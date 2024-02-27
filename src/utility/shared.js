



// Función para validar la contraseña
export async function validatePassword(password) {
  // Comprueba si la contraseña tiene entre 6 y 12 caracteres
  if (password.length < 6 || password.length > 12) {
    throw new Error('La contraseña debe tener entre 6 y 12 caracteres');
  }

  // Comprueba si la contraseña contiene al menos un símbolo especial, un número y una mayúscula
  if (!/[!@#$%^&*(),.?":{}|<>]/g.test(password) || !/\d/g.test(password) || !/[A-Z]/g.test(password)) {
    throw new Error('La contraseña debe contener al menos un símbolo especial, un número y una mayúscula');
  }

  // Comprueba si la contraseña contiene espacios en blanco
  if (/\s/g.test(password)) {
    throw new Error('La contraseña no debe contener espacios en blanco');
  }
}

// Función para validar el teléfono
export async function validatePhone(phone) {
  // Comprueba si el teléfono tiene al menos 5 caracteres
  if (phone.length < 5) {
    throw new Error('El teléfono debe tener al menos 5 caracteres')
  }

  // Comprueba si el teléfono contiene letras o símbolos
  if (/[a-zA-Z!@#$%^&*(),.?":{}|<>]/g.test(phone)) {
    throw new Error('El teléfono no debe contener letras ni símbolos')
  }

  // Comprueba si el teléfono contiene espacios en blanco
  if (/\s/g.test(phone)) {
    throw new Error('El teléfono no debe contener espacios en blanco')
  }
}


// Función para convertir una cadena a un número entero
export async function stringToInt(str) {
  const num = parseInt(str, 10);
  // Si la conversión falla, lanzamos un error
  if (isNaN(num)) {
    throw new Error('Error al convertir la cadena a un número');
  }
  return num;
}


export async function positiveValue(str) {
  try {
    const num = await stringToInt(str)
    // Si el número es negativo, lanzamos un error
    if (num < 0) {
      throw new Error('Ingrese un numero positivo');
    }
    return num

  } catch (error) {
    // Si hay un error, lo lanzamos
    throw error
  }
}


export async function formateoDeFecha(fecha) {
  const año = fecha.getFullYear()
  const mes = fecha.getMonth() + 1; // Se suma 1 porque los meses se cuentan desde 0 (enero es 0)
  const dia = fecha.getDate() + 1
  // Formatear la fecha en el formato deseado (YYYY-MM-DD)
  const fNacimiento = `${año}-${mes < 10 ? '0' : ''}${mes}-${dia < 10 ? '0' : ''}${dia}`
}