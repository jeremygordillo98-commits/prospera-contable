const fs = require('fs');

// 1. Leemos el archivo original
const rawData = fs.readFileSync('PlanCuentas.csv', 'utf8');

// 2. Separamos el texto línea por línea
const lineas = rawData.split('\n');

// Preparamos la nueva cabecera (ahora separada por comas)
let nuevoCSV = "codigo,cuenta,tipo\n";

// 3. Procesamos cada línea (empezamos desde 1 para saltar la cabecera vieja)
for (let i = 1; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    if (!linea) continue; // Saltamos si hay líneas vacías al final

    // Separamos la línea usando el punto y coma original
    const columnas = linea.split(';');

    if (columnas.length >= 2) {
        const codigo = columnas[0].trim();

        // Aquí ocurre la magia: borramos los espacios en blanco
        const cuenta = columnas[1].trim();

        // Si no hay tipo, le asignamos "Agrupador" para que Supabase no de error
        const tipo = (columnas[2] && columnas[2].trim() !== '') ? columnas[2].trim() : 'Agrupador';

        // Envolvemos la cuenta en comillas dobles por si alguna tiene una coma en su nombre
        const cuentaSegura = `"${cuenta}"`;

        // Reconstruimos la línea con comas
        nuevoCSV += `${codigo},${cuentaSegura},${tipo}\n`;
    }
}

// 4. Guardamos el resultado en un archivo nuevo
fs.writeFileSync('PlanCuentas_Limpio.csv', nuevoCSV, 'utf8');
console.log('✅ ¡Proceso terminado! Busca el archivo PlanCuentas_Limpio.csv');