import { Request, Response } from 'express';
import { Controller, Get } from '@overnightjs/core';
import { Service } from 'typedi';

@Service()
@Controller('generic')
export default class Generic {
  @Get('')
  get(_req: Request, res: Response) {
    return res.json({ working: true });
  }
}
