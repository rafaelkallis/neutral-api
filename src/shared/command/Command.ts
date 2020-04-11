import { Request } from 'shared/mediator/Request';

export abstract class Command<T> extends Request<T> {}
