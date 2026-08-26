import { createExpressApp } from '../server.js';

let appInstance: any = null;

function getApp() {
  if (!appInstance) {
    appInstance = createExpressApp();
  }
  return appInstance;
}

export default function handler(req: any, res: any) {
  const app = getApp();
  return app(req, res);
}

