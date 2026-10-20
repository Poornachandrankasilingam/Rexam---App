let appHandler: any;

async function getApp() {
  if (!appHandler) {
    try {
      const mod = await import('../backend/dist/app.js');
      appHandler = mod.default || mod;
    } catch {
      const mod = await import('../backend/src/app.js');
      appHandler = mod.default || mod;
    }
  }
  return appHandler;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}
