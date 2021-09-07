import { Request, Response } from 'express';
import { Controller, Get } from '@overnightjs/core';

@Controller('me')
export default class Me {
  @Get('')
  get(req: Request, res: Response) {
    return res.json({ account: req.account });
  }
}
