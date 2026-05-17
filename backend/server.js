import app from "./src/app.js";
import { env } from "./src/config/env.js";

app.listen(env.port, () => {
  console.log(`✅ SSA API démarrée sur http://localhost:${env.port}`);
  console.log(`   Environnement : ${env.nodeEnv}`);
  console.log(`   Health check  : http://localhost:${env.port}/health`);
});