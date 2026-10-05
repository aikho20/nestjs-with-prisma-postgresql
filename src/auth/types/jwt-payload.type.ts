import { UserType } from "../../generated/prisma/enums";

export interface JwtAccessPayload{
    userId:string;
    email:string;
    userType:UserType;
    sid:string;
}

export interface RefreshTokenPayload{
    userId:string;
    sessionId:string;
}