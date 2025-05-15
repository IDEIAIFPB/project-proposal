import * as dotenv from 'dotenv';

dotenv.config();

export const Env = {
    ACCESS_TOKEN: process.env.ACCESS_TOKEN,
    PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
};
