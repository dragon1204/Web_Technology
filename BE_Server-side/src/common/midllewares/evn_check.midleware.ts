import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class EvnCheckMiddleware implements NestMiddleware{
    constructor(private configService: ConfigService){}

    use(req, res, next: () => void){
        const secret_key = this.configService.get<string>("JWT_SECRET")
        if(!secret_key){
            throw new Error("Thiếu Secret_key")
          
        }

        const data_url = this.configService.get<string>("DATABASE_URL")
        if(!data_url){
            throw new Error( "the evn_file los database_url")
        }

       next()
    }
}
