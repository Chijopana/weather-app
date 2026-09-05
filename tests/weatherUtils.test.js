/**
 * Pruebas de utils/weatherUtils.
 *
 * Sin framework a propósito: el proyecto no tenía ninguno y añadir Jest o
 * Vitest para comprobar funciones puras sería desproporcionado. Se ejecutan con
 * `npm run test:utils`, que primero transpila el módulo TypeScript.
 */
const U = require('../.tmp-test/utils/weatherUtils.js');

let pass = 0, fail = 0;
const check = (name, actual, expected) => {
  const ok = String(actual) === String(expected);
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASA' : 'FALLA'}  ${name}\n        obtenido=${actual}  esperado=${expected}`);
};

console.log('TZ del proceso:', Intl.DateTimeFormat().resolvedOptions().timeZone, '\n');

// --- El bug original: hora del pronostico mostrada en la tz del navegador ---
// 2026-09-05 14:00 en Tokio == epoch 1788584400
const tokyo2pm = Math.floor(Date.parse('2026-09-05T14:00:00+09:00') / 1000);
check('Hora de Tokio se muestra en hora de Tokio', U.formatHour(tokyo2pm, 'Asia/Tokyo'), '14:00');
check('La misma marca en Caracas son las 01:00', U.formatHour(tokyo2pm, 'America/Caracas'), '01:00');

// Como fallaba antes: new Date("2026-09-05 14:00") se interpretaba en local
const buggy = new Date('2026-09-05 14:00');
console.log(`        (metodo antiguo daba: ${String(buggy.getHours()).padStart(2,'0')}:00 sea cual sea la ciudad)\n`);

// --- El bug del dia desplazado: new Date("YYYY-MM-DD") es medianoche UTC ---
// date_epoch de 2026-09-05 en Caracas (UTC-4) = 2026-09-05T04:00:00Z
const caracasDay = Math.floor(Date.parse('2026-09-05T00:00:00-04:00') / 1000);
check('Dia diario no se desplaza en zonas UTC negativas', U.formatDay(caracasDay, 'America/Caracas'), 'sáb 5');
const oldWay = new Date('2026-09-05');
console.log(`        (metodo antiguo, new Date("2026-09-05") en local: ${oldWay.toLocaleDateString('es-ES',{weekday:'short',day:'numeric'})})\n`);

// --- Etiquetas relativas ---
const now = Math.floor(Date.parse('2026-09-05T10:00:00-04:00') / 1000);
check('Hoy', U.formatRelativeDay(caracasDay, now, 'America/Caracas'), 'Hoy');
const tomorrow = caracasDay + 86400;
check('Manana', U.formatRelativeDay(tomorrow, now, 'America/Caracas'), 'Mañana');

// --- Conversion de unidades ---
check('0C -> 32F', Math.round(U.toUnit(0, 'F')), 32);
check('Delta de 10C son 18F (sin el +32)', U.deltaToUnit(10, 'F'), 18);
check('formatTempUnit redondea', U.formatTempUnit(21.6, 'C'), '22°C');
check('formatTemp con nulo', U.formatTemp(undefined, 'C'), '--');

// --- Horas astro ---
check('06:17 AM', U.formatAstroTime('06:17 AM'), '06:17');
check('12:05 AM es medianoche', U.formatAstroTime('12:05 AM'), '00:05');
check('12:05 PM es mediodia', U.formatAstroTime('12:05 PM'), '12:05');
check('06:34 PM', U.formatAstroTime('06:34 PM'), '18:34');
check('Texto no parseable se devuelve tal cual', U.formatAstroTime('No sunrise'), 'No sunrise');
check('astroTimeToMinutes', U.astroTimeToMinutes('06:17 AM'), 377);
check('astroTimeToMinutes invalido', U.astroTimeToMinutes('No sunset'), -1);

// --- Condiciones por codigo (independiente del idioma) ---
check('1000 despejado', U.conditionKind(1000), 'clear');
check('1240 chubasco -> lluvia', U.conditionKind(1240), 'rain');
check('1276 tormenta', U.conditionKind(1276), 'storm');
check('1225 nieve', U.conditionKind(1225), 'snow');
check('codigo desconocido', U.conditionKind(9999), 'clear');
check('lluvia tiene precipitacion', U.hasPrecipitation('rain'), 'true');
check('nublado no tiene precipitacion', U.hasPrecipitation('clouds'), 'false');

// --- Icono protocol-relative ---
check('iconUrl', U.iconUrl('//cdn.weatherapi.com/a.png'), 'https://cdn.weatherapi.com/a.png');

// --- Viento ---
check('0 grados = N', U.windDirectionLabel(0), 'N');
check('90 grados = E', U.windDirectionLabel(90), 'E');
check('270 grados = O', U.windDirectionLabel(270), 'O');
check('370 grados envuelve a N', U.windDirectionLabel(370), 'N');

// --- Regresion ---
const r = U.linearRegression([1,2,3,4,5]);
check('pendiente de recta perfecta', r.slope.toFixed(3), '1.000');
check('R2 de recta perfecta', U.rSquared([1,2,3,4,5]).toFixed(2), '1.00');
check('R2 de serie plana', U.rSquared([5,5,5,5,5]).toFixed(2), '1.00');
check('regresion con 1 punto no rompe', U.linearRegression([7]).intercept, 7);

// --- UV / AQI ---
check('UV 3 moderado', U.getUvInfo(3).label, 'Moderado');
check('UV 12 extremo', U.getUvInfo(12).label, 'Extremo');
check('AQI 1 buena', U.getAqiInfo(1).label, 'Buena');
check('AQI 6 peligrosa', U.getAqiInfo(6).label, 'Peligrosa');
check('AQI ausente', U.getAqiInfo(undefined), 'null');

// --- Tiempo relativo ---
const t = Date.now();
check('hace 5 min', U.formatRelativeTime(t - 5*60*1000, t), 'hace 5 min');
check('hace instantes', U.formatRelativeTime(t - 10*1000, t), 'hace instantes');

console.log(`\n${pass} pasan, ${fail} fallan`);
process.exit(fail ? 1 : 0);
