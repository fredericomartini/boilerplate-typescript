import { NextFunction, Request, Response } from 'express';
import { Controller, Get, Post } from '@overnightjs/core';
import { Service } from 'typedi';

@Service()
@Controller('webhooks')
export default class WebhookController {
  @Get('')
  async get(_req: Request, res: Response) {
    return res.json({ webhook: true });
  }

  @Post('')
  async post(req: Request, res: Response, _next: NextFunction) {
    console.log('........................... WEBHOOK RECEIVED ...........................');

    console.log(JSON.stringify(req.body));

    console.log('........................... WEBHOOK RECEIVED ...........................');
    const { body } = req;

    return res.json({ body });
  }
}
