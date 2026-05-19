import { createApp } from "./app";
import config from "./config";

let app = createApp();

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
