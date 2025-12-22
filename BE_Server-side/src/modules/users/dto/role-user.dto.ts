import { IsInt, IsString } from "class-validator";

export class RoleUserDto {
    @IsInt()
    id : number;

    @IsString()
    role: string;
}