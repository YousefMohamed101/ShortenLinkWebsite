
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const length = alphabet.length;

function Generateshort(id){
    let number = id;
    let result = '';
    while(number>0){
        result += alphabet[number%length];
        number = Math.floor(number/length);
    }


    return result;
}

export default Generateshort