import { Account } from '@modules/Auth/types';

export {};

declare global {
    namespace Express {
        interface Request {
            account?: Account
        }
    }

}
