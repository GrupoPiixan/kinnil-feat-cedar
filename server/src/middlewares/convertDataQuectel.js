/**
 * * Método para convertir los bits a grados centígrados
 * 
 * @param {bits} 
 * @return {convertion: celsius} 
 */
const convertBitsToTemperature = async (bits) => {
    // return ((200 / 392.8) * (bits - 98.208)) - 50;
    // * Bits to farhenheit
    const temp = (bits / 204.8) * 12.5;
    // * Farhenheit to Celsius
    return (temp - 32) * .55;
};

/**
 * * Método pra convertir los grados centígrados a bits
 *
 * @param {temperature}
 * @return {convertion: bits}
 */
const convertTemperatureToBits = async (temperature) => {
    // return ((temperature + 50) / (200 / 392.8)) + 98.208;
    // * Celsius to farhenheit
    const temp = (temperature * 1.8) + 32;
    // * Farhenheit to bits
    return (temp / 12.5) * 204.8;
};

/**
 * * Método para convertir los bits a bares
 *
 * @param {bits}
 * @return {convertion: pressure}
 */
const convertBitsToPressure = async (bits) => {
    // const presure = ((400 / 392.832) * (bits - 98.208));
    // return presure < 0 ? 0 : presure;
    return (bits < 480 ? 0 : (bits - 480) * 2.63);
};

/**
 * * Método para convertir los bares a bits
 *
 * @param {pressure}
 * @return {convertion: bits}}
 */
const convertPressureToBits = async (pressure) => {
    return (pressure / 2.63) + 480;
};

/**
 * * Método para convertir los milliamperes a su valor real del sensor a1
 * 
 * @param {milliamperes}
 * @return {convertion: realValue}
*/
const convertMilliamperesToRealValueA1 = (milliamperes) => {
    const correctedData = milliamperes - 4;
    let response = 0;

    if (correctedData < 0) return 0;

    if (correctedData >= 0 && correctedData <= 0.92) response = correctedData * 217.39;
    if (correctedData > 0.92 && correctedData <= 1.5) response = correctedData * 200;
    if (correctedData > 1.5 && correctedData <= 1.8) response = correctedData * 265;
    if (correctedData > 1.8 && correctedData <= 2.8) response = correctedData * 250;
    if (correctedData > 2.8 && correctedData <= 3.8) response = correctedData * 234.07;
    if (correctedData > 3.8 && correctedData <= 4.2) response = correctedData * 219.46;
    if (correctedData > 4.2 && correctedData <= 4.9) response = correctedData * 219.84;
    if (correctedData > 4.9 && correctedData <= 5.9) response = correctedData * 215.98;
    if (correctedData > 5.9 && correctedData <= 6.2) response = correctedData * 233.43;
    if (correctedData > 6.2) response = correctedData * 230;


    return roundTen(response);
};

/**
 * * Método para convertir los milliamperes a su valor real del sensor a2
 *
 * @param {milliamperes}
 * @return {convertion: realValue}
*/
const convertMilliamperesToRealValueA2 = (milliamperes) => {
    return milliamperes === 4 ? 0 : milliamperes;
};

/**
 * * Método para redondear a la decena
 *
 * @param {value}
 * @return {roundValue}
 * */
const roundTen = (value) => Math.round(value / 10) * 10;

module.exports = {
    convertBitsToTemperature,
    convertTemperatureToBits,
    convertBitsToPressure,
    convertPressureToBits,
    convertMilliamperesToRealValueA1,
    convertMilliamperesToRealValueA2
}