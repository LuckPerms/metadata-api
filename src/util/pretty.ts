import { NextFunction, Request, Response } from 'express';

export default function (req: Request, res: Response, next: NextFunction) {
  if (typeof req.query['pretty'] !== 'undefined') {
    res.json = function (body) {
      if (!res.get('Content-Type')) {
        res.set('Content-Type', 'application/json');
      }
      return res.send(JSON.stringify(body, null, 2));
    };
  }
  next();
}
