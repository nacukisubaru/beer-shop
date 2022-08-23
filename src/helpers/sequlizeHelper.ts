import sequelize from "sequelize";

interface IGetMinMaxQuery {
    colMin: string,
    colMax: string,
    minOutput: string,
    maxOutput: string
}

export const getMinQuery = (col:string, outputProp: string) => {
   return [sequelize.fn('min', sequelize.col(col)), outputProp];
}

export const getMaxQuery = (col:string, outputProp: string) => {
    return [sequelize.fn('max', sequelize.col(col)), outputProp];
}

export const getMinMaxQuery = (arg: IGetMinMaxQuery) => {
    const {colMin, colMax, maxOutput, minOutput} = arg;
    return [
        getMinQuery(colMin, minOutput),
        getMaxQuery(colMax, maxOutput)
    ];
}