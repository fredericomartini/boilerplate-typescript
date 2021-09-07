
import { Controller, ChildControllers } from '@overnightjs/core';
import Me from '@modules/Me/controller';
import Container, { Service } from 'typedi';
import Generic from '@modules/Generic/controller';
import WebhookController from '@modules/Webhook/Webhook/Webhook.controller';
// import isAuthenticated from '@middlewares/isAuthenticated';

@Service()
@Controller('v1')
// @ClassMiddleware([isAuthenticated])
@ChildControllers([
  new Me(),
  Container.get(Generic),
  Container.get(WebhookController)
])
export default class V1 { }
