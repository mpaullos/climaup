import type { Request, Response } from 'express';

export function configHandler(_req: Request, res: Response) {
  const serverKey = process.env.OPENWEATHER_API_KEY || '';
  const hasServerKey =
    serverKey.length > 5 && serverKey !== 'SUA_CHAVE_OPENWEATHERMAP';

  return res.json({
    hasServerKey,
  });
}

export default configHandler;
