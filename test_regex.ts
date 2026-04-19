const text2 = "2020 Tao 125, 900 $US, Union City, CA, listing 1338679954862637";
const text1 = "2008 Lexus es, 4 500 $US, Santa Clara, CA, listing 4173138016166414";

const priceRegex = /(?:(?:[A-Za-z]{1,3})?[\$£€]\s*\d+(?:[.,]\d+)*(?:\s\d{3})*|(?<=\s)\d+(?:[.,]\d+)*(?:\s\d{3})*\s*[\$£€](?:[A-Za-z]{1,3})?(?=\s|,|$)|Gratuit|Free)/i;

console.log("TEXT 2:", text2.match(priceRegex)?.[0]);
console.log("TEXT 1:", text1.match(priceRegex)?.[0]);
