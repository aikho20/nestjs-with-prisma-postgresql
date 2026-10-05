import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import dotenv from 'dotenv'
import * as bcrypt from 'bcryptjs'
dotenv.config()

const prisma = new PrismaClient({adapter: new PrismaPg({connectionString:process.env.DATABASE_URL})}) 

async function main() {
    /**Seeding data */
    console.log('Seeding the platform admin user')
    const email ='marco.deguzman.ico@gmail.com' 
    const password = 'Temporary123!'
    const passwordHash = await bcrypt.hash(password,10)
    await prisma.user.upsert({
        where:{
            email:email,
        },
        update:{
            passwordHash:passwordHash
        },
        create:{
            email,  
            fullName:'admin',
            passwordHash,
            userType:'PLATFORM_ADMIN',
            twoFactorEnabled:false,
            twoFactorSecret:'',
            phone:'09270238375'
        }
    })

    console.log('Succressfully created admin!')
    
}

main()