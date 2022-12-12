export const isNumber = (value: any): boolean => {
    return Number.isInteger(Number(value));
}

export const isEmptyObject = (obj:object) => {
    for (let key in obj) {
        return false;
    }
    return true;
}

export const isNumeric = n => !isNaN(n);