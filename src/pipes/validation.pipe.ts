import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ValidationException } from "src/exceptions/validation.exception";

@Injectable()
export class ValidationPipe implements PipeTransform<any>{
    async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
   
        const obj = plainToClass(metadata.metatype, value);
        if(obj) {
            const errors = await validate(obj);

            if(errors.length > 0) {
                let message = errors.map(err => {
                    return `${err.property} - ${Object.values(err.constraints).join(', ')}`
                }).toString();

                throw new ValidationException(message);
            }
            return value;
        }
 
    }
}