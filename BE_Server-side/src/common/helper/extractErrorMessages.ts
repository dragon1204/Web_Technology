import { ValidationError } from "@nestjs/common";

export const extractErrorMessages = (errors: ValidationError[]): string[] => {
    const messages: string[] = [];
    const traverseErrors = (errors: ValidationError[], parentKey = '') => {
        errors.forEach((error) => {
            const key = parentKey
                ? `${parentKey}.${error.property}`
                : error.property;

            if (error.constraints) {
                messages.push(
                    ...Object.values(error.constraints).map((msg) => `${key}: ${msg}`),
                );
            }

            if (error.children && error.children.length > 0) {
                traverseErrors(error.children, key);
            }
        });
    };

    traverseErrors(errors);
    return messages;
};